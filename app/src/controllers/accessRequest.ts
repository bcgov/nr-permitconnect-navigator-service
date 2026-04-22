import { transactionWrapper } from '../db/utils/transactionWrapper.ts';
import {
  createUserAccessRequest,
  getAccessRequest,
  getAccessRequests,
  updateAccessRequest
} from '../services/accessRequest.ts';
import { getInitiative } from '../services/initiative.ts';
import { createUser, readUser } from '../services/user.ts';
import {
  assignGroup,
  getCorrespondingGlobalGroup,
  getGroups,
  getSubjectGroups,
  getSubjectInitiatives,
  removeGroup
} from '../services/yars.ts';
import { Problem } from '../utils/index.ts';
import { AccessRequestStatus, GroupName, IdentityProviderKind, Initiative } from '../utils/enums/application.ts';

import type { Request, Response } from 'express';
import type { PrismaTransactionClient } from '../db/dataConnection.ts';
import type { AccessRequest, Group, User } from '../types/index.ts';

const isUserAdmin = async (
  tx: PrismaTransactionClient,
  currentInitiative: Initiative,
  userGroups: Group[]
): Promise<boolean> => {
  const initiative = await getInitiative(tx, currentInitiative);
  return userGroups.some(
    (group: Group) =>
      group.name === GroupName.DEVELOPER ||
      (group.name === GroupName.ADMIN && group.initiativeId === initiative.initiativeId)
  );
};

// Request to create user & access
export const createUserAccessRequestController = async (
  req: Request<never, never, { accessRequest: AccessRequest & { update: boolean }; user: User }>,
  res: Response
) => {
  const response = await transactionWrapper(async (tx: PrismaTransactionClient) => {
    const { accessRequest, user } = req.body;

    // Check if the requestee is an admin
    const isAdmin = await isUserAdmin(tx, req.currentContext.initiative!, req.currentAuthorization.groups);

    // Get all the groups for the current initiative
    const groups = await getGroups(tx, req.currentContext.initiative);

    // Groups the current user can modify
    const userAllowedGroups = [GroupName.NAVIGATOR, GroupName.NAVIGATOR_READ_ONLY];
    if (isAdmin) {
      userAllowedGroups.unshift(GroupName.ADMIN, GroupName.SUPERVISOR);
    }
    const modifiableGroups = groups.filter((x) => userAllowedGroups.includes(x.name));

    if (accessRequest.grant && !modifiableGroups.some((x) => x.groupId == accessRequest.groupId)) {
      throw new Problem(403, { detail: 'Cannot modify requested group' });
    }

    // Create or get the user that access is being requested for
    let userResponse;
    const existingUser = !!user.userId;
    if (!existingUser) userResponse = await createUser(tx, user);
    else userResponse = await readUser(tx, user.userId);

    if (!userResponse) throw new Problem(404, { detail: 'User not found' });

    const accessUserGroups = await getSubjectGroups(tx, userResponse.sub);

    const requestedGroup = groups.find((x) => x.groupId === accessRequest.groupId);
    const userAlreadyInInitiative = accessUserGroups.some((x) => x.initiativeId === requestedGroup?.initiativeId);

    if (accessRequest.grant && !accessRequest.update && userAlreadyInInitiative) {
      throw new Problem(409, { detail: 'User already exists' });
    }
    if (
      accessRequest.grant &&
      accessRequest.groupId &&
      accessUserGroups.some((x) => x.groupId === accessRequest.groupId)
    ) {
      throw new Problem(409, { detail: 'User is already assigned this group' });
    }
    if (userResponse.idp !== IdentityProviderKind.IDIR) {
      throw new Problem(409, { detail: 'User must be an IDIR user to be assigned this group' });
    }
    if (accessRequest.grant && !accessRequest.groupId) {
      throw new Problem(422, { detail: 'Must provide a group to grant' });
    }

    const isGroupUpdate = existingUser && accessRequest.grant;
    let data;

    // Store the current initiative ID to reference
    const currentInitiativeId = (await getInitiative(tx, req.currentContext.initiative)).initiativeId;

    if (isGroupUpdate) {
      // Remove current initiative groups
      const currentInitiativeGroups = accessUserGroups.filter((x) => x.initiativeId === currentInitiativeId);
      const correspondingGlobalGroups = await Promise.all(
        currentInitiativeGroups.map(async (x) => await getCorrespondingGlobalGroup(tx, x.groupId))
      );
      await Promise.all(currentInitiativeGroups.map(async (x) => await removeGroup(tx, userResponse.sub, x.groupId)));
      await Promise.all(correspondingGlobalGroups.map(async (x) => await removeGroup(tx, userResponse.sub, x.groupId)));

      // Assign new groups
      await assignGroup(tx, userResponse.sub, accessRequest.groupId);
      const correspondingGlobalGroup = await getCorrespondingGlobalGroup(tx, accessRequest.groupId);
      await assignGroup(tx, userResponse.sub, correspondingGlobalGroup.groupId);

      // Mock an access request for the response
      data = {
        userId: userResponse?.userId,
        grant: accessRequest.grant,
        groupId: accessRequest.groupId,
        status: AccessRequestStatus.APPROVED
      };
    } else if (isAdmin) {
      if (accessRequest.grant) {
        // Assign new groups
        await assignGroup(tx, userResponse.sub, accessRequest.groupId);
        const correspondingGlobalGroup = await getCorrespondingGlobalGroup(tx, accessRequest.groupId);
        await assignGroup(tx, userResponse.sub, correspondingGlobalGroup.groupId);

        // Mock an access request for the response
        data = {
          userId: userResponse?.userId,
          grant: accessRequest.grant,
          groupId: accessRequest.groupId,
          status: AccessRequestStatus.APPROVED
        };
      } else {
        // Remove current initiative groups
        const currentInitiativeGroups = accessUserGroups.filter((x) => x.initiativeId === currentInitiativeId);
        const correspondingGlobalGroups = await Promise.all(
          currentInitiativeGroups.map(async (x) => await getCorrespondingGlobalGroup(tx, x.groupId))
        );
        await Promise.all(currentInitiativeGroups.map(async (x) => await removeGroup(tx, userResponse.sub, x.groupId)));
        await Promise.all(
          correspondingGlobalGroups.map(async (x) => await removeGroup(tx, userResponse.sub, x.groupId))
        );
      }
    } else {
      data = await createUserAccessRequest(tx, {
        ...accessRequest,
        userId: userResponse?.userId
      });
    }

    return { isAdmin, data };
  });

  res.status(response.isAdmin ? 200 : 201).json(response.data);
};

export const processUserAccessRequestController = async (
  req: Request<{ accessRequestId: string }, never, { approve: boolean }>,
  res: Response
) => {
  await transactionWrapper<void>(async (tx: PrismaTransactionClient) => {
    const accessRequest = await getAccessRequest(tx, req.currentContext.initiative!, req.params.accessRequestId);

    if (accessRequest) {
      const userResponse = await readUser(tx, accessRequest.userId);

      if (userResponse) {
        const userGroups: Group[] = await getSubjectGroups(tx, userResponse.sub);

        // If request is approved then grant or remove access
        if (req.body.approve) {
          if (accessRequest.grant) {
            if (!accessRequest.groupId) {
              throw new Problem(422, { detail: 'Must provided a role to grant' });
            }
            if (accessRequest.groupId && userGroups.map((x) => x.groupId).includes(accessRequest.groupId)) {
              throw new Problem(409, { detail: 'User is already assigned this role' });
            }
            if (userResponse.idp !== IdentityProviderKind.IDIR) {
              throw new Problem(409, { detail: 'User must be an IDIR user to be assigned this role' });
            }

            // Assign groups
            const correspondingGlobalGroup = await getCorrespondingGlobalGroup(tx, accessRequest.groupId);
            await assignGroup(tx, userResponse.sub, accessRequest.groupId);
            await assignGroup(tx, userResponse.sub, correspondingGlobalGroup.groupId);
          } else {
            // Remove all user groups for the initiative
            const initiative = userGroups.find((x) => x.groupId === accessRequest.groupId)?.initiativeId;
            if (!initiative) throw new Problem(404, { detail: 'Can\t determine initiative' });
            const removeGroups = userGroups.filter((x) => x.initiativeId === initiative);
            await Promise.all(removeGroups.map(async (x) => await removeGroup(tx, userResponse.sub, x.groupId)));
          }

          // Update access request status
          await updateAccessRequest(tx, { status: AccessRequestStatus.APPROVED }, accessRequest.accessRequestId);
        } else {
          await updateAccessRequest(tx, { status: AccessRequestStatus.REJECTED }, accessRequest.accessRequestId);
        }
      } else {
        throw new Problem(404, { detail: 'User does not exist' });
      }
    }
  });

  res.status(204).end();
};

export const getAccessRequestsController = async (req: Request, res: Response) => {
  const response = await transactionWrapper<AccessRequest[]>(async (tx: PrismaTransactionClient) => {
    return await getAccessRequests(tx, req.currentContext.initiative!);
  });
  res.status(200).json(response);
};
