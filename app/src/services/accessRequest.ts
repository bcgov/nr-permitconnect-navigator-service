import { v4 as uuidv4 } from 'uuid';

import { assignPermissions } from './coms.ts';

import { isUserAdmin, removeUserGroups } from '../domains/accessRequest.ts';
import { createUser } from '../domains/user.ts';
import { assignGroup, getCorrespondingGlobalGroup, getGroups } from '../domains/yars.ts';
import { unitOfWork } from '../repository/uow.ts';
import { AccessRequestStatus, GroupName, IdentityProviderKind, Initiative } from '../utils/enums/application.ts';
import { getLogger } from '../utils/log.ts';
import Problem from '../utils/problem.ts';

import type { AccessRequest, CurrentAuthorization, CurrentContext, Group, User } from '../types/index.ts';

const log = getLogger(module.filename);

/**
 * Retrieve all access requests
 * @param initiative - The initiative for which the access requests belongs to
 * @returns A Promise that resolves to the access requests matching the given options
 */
export const getAccessRequestsService = async (initiative: Initiative): Promise<AccessRequest[]> => {
  return await unitOfWork.execute(async ({ accessRequest }) => {
    const response = await accessRequest.findMany({
      where: {
        group: {
          initiative: {
            code: initiative
          }
        }
      },
      include: {
        group: true
      }
    });

    return response;
  });
};

export const createAccessRequestService = async (
  currentContext: CurrentContext,
  currentAuthorization: CurrentAuthorization,
  accessReq: AccessRequest & { update: boolean },
  accessUser: User
) => {
  return await unitOfWork.execute(
    async ({ accessRequest, group, identityProvider, initiative, subjectGroup, user }) => {
      // Check if the requestee is an admin
      const isAdmin = await isUserAdmin({ initiative }, currentContext.initiative, currentAuthorization.groups);

      // Get all the groups for the current initiative
      const groups = await getGroups({ group, initiative }, currentContext.initiative);

      // Groups the current user can modify
      const userAllowedGroups = [GroupName.NAVIGATOR, GroupName.NAVIGATOR_READ_ONLY];
      if (isAdmin) {
        userAllowedGroups.unshift(GroupName.ADMIN, GroupName.SUPERVISOR);
      }
      const modifiableGroups = groups.filter((x) => userAllowedGroups.includes(x.name));

      if (accessReq.grant && !modifiableGroups.some((x) => x.groupId == accessReq.groupId)) {
        throw new Problem(403, { detail: 'Cannot modify requested group' });
      }

      // Create or get the user that access is being requested for
      let userResponse;
      const existingUser = !!accessUser.userId;
      if (!existingUser) userResponse = await createUser({ identityProvider, user }, accessUser);
      else {
        userResponse = await user.findUnique({
          userId: accessUser.userId
        });
      }

      if (!userResponse) throw new Problem(404, { detail: 'User not found' });

      const accessUserGroups = await subjectGroup.getSubjectGroups(userResponse.sub);

      const requestedGroup = groups.find((x) => x.groupId === accessReq.groupId);
      const userAlreadyInInitiative = accessUserGroups.some((x) => x.initiativeId === requestedGroup?.initiativeId);

      if (accessReq.grant && !accessReq.update && userAlreadyInInitiative) {
        throw new Problem(409, { detail: 'User already exists' });
      }
      if (accessReq.grant && accessReq.groupId && accessUserGroups.some((x) => x.groupId === accessReq.groupId)) {
        throw new Problem(409, { detail: 'User is already assigned this group' });
      }
      if (userResponse.idp !== IdentityProviderKind.AZUREIDIR) {
        throw new Problem(409, { detail: 'User must be an IDIR user to be assigned this group' });
      }
      if (accessReq.grant && !accessReq.groupId) {
        throw new Problem(422, { detail: 'Must provide a group to grant' });
      }

      const isGroupUpdate = existingUser && accessReq.grant && userAlreadyInInitiative;
      let data;

      let updateComsPerms = false;

      if (isGroupUpdate) {
        // Remove current initiative groups
        await removeUserGroups(
          { group, initiative, subjectGroup },
          userResponse.sub,
          currentContext.initiative,
          accessUserGroups
        );

        // Assign new groups
        await assignGroup({ group, subjectGroup }, userResponse.sub, accessReq.groupId);
        const correspondingGlobalGroup = await getCorrespondingGlobalGroup({ initiative, group }, accessReq.groupId);
        await assignGroup({ group, subjectGroup }, userResponse.sub, correspondingGlobalGroup.groupId);

        updateComsPerms = true;

        // Mock an access request for the response
        data = {
          userId: userResponse?.userId,
          grant: accessReq.grant,
          groupId: accessReq.groupId,
          status: AccessRequestStatus.APPROVED
        };
      } else if (isAdmin) {
        if (accessReq.grant) {
          // Assign new groups
          await assignGroup({ group, subjectGroup }, userResponse.sub, accessReq.groupId);
          const correspondingGlobalGroup = await getCorrespondingGlobalGroup({ initiative, group }, accessReq.groupId);
          await assignGroup({ group, subjectGroup }, userResponse.sub, correspondingGlobalGroup.groupId);

          // Mock an access request for the response
          data = {
            userId: userResponse?.userId,
            grant: accessReq.grant,
            groupId: accessReq.groupId,
            status: AccessRequestStatus.APPROVED
          };
        } else {
          // Remove current initiative groups
          await removeUserGroups(
            { group, initiative, subjectGroup },
            userResponse.sub,
            currentContext.initiative,
            accessUserGroups
          );
        }

        updateComsPerms = true;
      } else {
        const newAccessRequest = {
          accessRequestId: uuidv4(),
          grant: accessReq.grant,
          group: {
            connect: { groupId: accessReq.groupId }
          },
          status: AccessRequestStatus.PENDING,
          user: {
            connect: { userId: accessReq.userId }
          }
        };

        await accessRequest.create(newAccessRequest);
        data = accessRequest.findFirst({
          where: { accessRequestId: newAccessRequest.accessRequestId },
          include: { group: true }
        });
      }

      // Assign new COMS permissions
      if (updateComsPerms) {
        try {
          const groupsAfterUpdate = await subjectGroup.getSubjectGroups(userResponse.sub);
          await assignPermissions(currentContext, userResponse.sub, groupsAfterUpdate);
        } catch (e) {
          if (e instanceof Error) log.warn(e.message);
          if (e instanceof Problem) log.warn(e.detail);
        }
      }

      return { isAdmin, data };
    }
  );
};

export const processAccessRequestService = async (
  currentContext: CurrentContext,
  accessReqId: string,
  approve: boolean
) => {
  return await unitOfWork.execute(async ({ accessRequest, group, initiative, subjectGroup, user }) => {
    const accessReq = await accessRequest.findUniqueOrThrow({
      accessRequestId: accessReqId,
      group: {
        initiative: {
          code: currentContext.initiative
        }
      }
    });

    if (accessReq) {
      const userResponse = await user.findUnique({
        userId: accessReq.userId
      });

      if (userResponse) {
        const userGroups: Group[] = await subjectGroup.getSubjectGroups(userResponse.sub);

        // If request is approved then grant or remove access
        if (approve) {
          if (accessReq.grant) {
            if (!accessReq.groupId) {
              throw new Problem(422, { detail: 'Must provide a group to grant' });
            }
            if (accessReq.groupId && userGroups.map((x) => x.groupId).includes(accessReq.groupId)) {
              throw new Problem(409, { detail: 'User is already assigned this role' });
            }
            if (userResponse.idp !== IdentityProviderKind.AZUREIDIR) {
              throw new Problem(409, { detail: 'User must be an IDIR user to be assigned this role' });
            }

            // Assign groups
            const correspondingGlobalGroup = await getCorrespondingGlobalGroup(
              { initiative, group },
              accessReq.groupId
            );
            await assignGroup({ group, subjectGroup }, userResponse.sub, accessReq.groupId);
            await assignGroup({ group, subjectGroup }, userResponse.sub, correspondingGlobalGroup.groupId);
          } else {
            // Remove all user groups for the initiative
            await removeUserGroups(
              { group, initiative, subjectGroup },
              userResponse.sub,
              currentContext.initiative,
              userGroups
            );
          }

          // Update access request status
          await accessRequest.update(
            {
              accessRequestId: accessReq.accessRequestId
            },
            { status: AccessRequestStatus.APPROVED }
          );

          // Assign new COMS permissions
          const groupsAfterUpdate = await subjectGroup.getSubjectGroups(userResponse.sub);
          await assignPermissions(currentContext, userResponse.sub, groupsAfterUpdate);
        } else {
          await accessRequest.update(
            {
              accessRequestId: accessReq.accessRequestId
            },
            { status: AccessRequestStatus.REJECTED }
          );
        }
      } else {
        throw new Problem(404, { detail: 'User does not exist' });
      }
    }
  });
};
