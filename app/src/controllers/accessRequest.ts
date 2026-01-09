import { transactionWrapper } from '../db/utils/transactionWrapper.ts';
import {
  createUserAccessRequest,
  getAccessRequest,
  getAccessRequests,
  updateAccessRequest
} from '../services/accessRequest.ts';
import { getInitiative } from '../services/initiative.ts';
import { createUser, readUser } from '../services/user.ts';
import { assignGroup, getGroups, getSubjectGroups, removeGroup } from '../services/yars.ts';
import { Problem } from '../utils/index.ts';
import { AccessRequestStatus, GroupName, IdentityProvider, Initiative } from '../utils/enums/application.ts';

import type { Request, Response } from 'express';
import type { PrismaTransactionClient } from '../db/dataConnection.ts';
import type { AccessRequest, Group, User } from '../types/index.ts';

// Request to create user & access
export const createUserAccessRequestController = async (
  req: Request<never, never, { accessRequest: AccessRequest & { update: boolean }; user: User }>,
  res: Response
) => {
  const response = await transactionWrapper(async (tx: PrismaTransactionClient) => {
    const { accessRequest, user } = req.body;

    // Check if the requestee is an admin
    const initiative = await getInitiative(tx, req.currentContext.initiative as Initiative);
    const isAdmin =
      req.currentAuthorization?.groups.some(
        (group: Group) =>
          group.name === GroupName.DEVELOPER ||
          (group.name === GroupName.ADMIN && group.initiativeId === initiative.initiativeId)
      ) ?? false;

    // Groups the current user can modify
    const groups = await getGroups(tx, req.currentContext.initiative as Initiative);
    const requestedGroup = groups.find((x) => x.groupId === accessRequest.groupId);
    const userAllowedGroups = [GroupName.NAVIGATOR, GroupName.NAVIGATOR_READ_ONLY];
    if (isAdmin) {
      userAllowedGroups.unshift(GroupName.ADMIN, GroupName.SUPERVISOR);
    }
    const modifiableGroups = groups.filter((x) => userAllowedGroups.includes(x.name));

    let userResponse;
    const existingUser = !!user.userId;

    if (!existingUser) userResponse = await createUser(tx, user);
    else userResponse = await readUser(tx, user.userId);

    let accessUserGroups: Group[] = [];

    if (!userResponse) {
      throw new Problem(404, { detail: 'User not found' });
    } else {
      accessUserGroups = await getSubjectGroups(tx, userResponse.sub);
      const userInitiativeGroups = accessUserGroups.filter((x) => x.initiativeId === requestedGroup?.initiativeId);

      if (accessRequest.grant && !modifiableGroups.some((x) => x.groupId == accessRequest.groupId)) {
        throw new Problem(403, { detail: 'Cannot modify requested group' });
      }
      if (!accessRequest.update && userInitiativeGroups.length) {
        throw new Problem(409, { detail: 'User already exists' });
      }
      if (
        accessRequest.grant &&
        accessRequest.groupId &&
        accessUserGroups.map((x) => x.groupId).includes(accessRequest.groupId)
      ) {
        throw new Problem(409, { detail: 'User is already assigned this group' });
      }
      if (userResponse.idp !== IdentityProvider.IDIR) {
        throw new Problem(409, { detail: 'User must be an IDIR user to be assigned this group' });
      }
      if (accessRequest.grant && !accessRequest.groupId) {
        throw new Problem(422, { detail: 'Must provide a group to grant' });
      }
    }

    const isGroupUpdate = existingUser && accessRequest.grant;
    let data;

    if (isGroupUpdate) {
      // Remove all user groups for initiative
      const groupsToRemove = accessUserGroups.filter((x) => x.initiativeId === requestedGroup?.initiativeId);
      for (const g of groupsToRemove) {
        data = await removeGroup(tx, userResponse?.sub as string, g.groupId);
      }

      // Assign new group
      await assignGroup(tx, req.currentContext.bearerToken, user.sub, accessRequest.groupId);

      // Mock an access request for the response
      data = {
        userId: userResponse?.userId,
        grant: accessRequest.grant,
        groupId: accessRequest.groupId,
        status: AccessRequestStatus.APPROVED
      };
    } else if (isAdmin) {
      if (accessRequest.grant) {
        await assignGroup(tx, req.currentContext.bearerToken, user.sub, accessRequest.groupId);
        // Mock an access request for the response
        data = {
          userId: userResponse?.userId,
          grant: accessRequest.grant,
          groupId: accessRequest.groupId,
          status: AccessRequestStatus.APPROVED
        };
      } else {
        // Remove requested group if provided - otherwise remove all user groups for initiative
        const groupsToRemove = accessRequest.groupId
          ? [accessRequest.groupId]
          : accessUserGroups.filter((x) => x.initiativeId === requestedGroup?.initiativeId).map((x) => x.groupId);
        for (const groupId of groupsToRemove) {
          data = await removeGroup(tx, userResponse?.sub as string, groupId);
        }
      }
    } else {
      data = await createUserAccessRequest(tx, {
        ...accessRequest,
        userId: userResponse?.userId as string
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
    const accessRequest = await getAccessRequest(
      tx,
      req.currentContext.initiative as Initiative,
      req.params.accessRequestId
    );

    if (accessRequest) {
      const userResponse = await readUser(tx, accessRequest.userId);

      if (userResponse) {
        const groups = await getGroups(tx, req.currentContext.initiative as Initiative);
        const requestedGroup = groups.find((x) => x.groupId === accessRequest.groupId);

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
            if (userResponse.idp !== IdentityProvider.IDIR) {
              throw new Problem(409, { detail: 'User must be an IDIR user to be assigned this role' });
            }

            await assignGroup(tx, undefined, userResponse.sub, accessRequest.groupId);
          } else {
            // Remove requested group if provided - otherwise remove all user groups for initiative
            const groupsToRemove = accessRequest.groupId
              ? [accessRequest.groupId]
              : userGroups.filter((x) => x.initiativeId === requestedGroup?.initiativeId).map((x) => x.groupId);
            for (const groupId of groupsToRemove) {
              await removeGroup(tx, userResponse.sub, groupId);
            }
          }

          // Update access request status
          accessRequest.status = AccessRequestStatus.APPROVED;
          await updateAccessRequest(tx, accessRequest);
        } else {
          accessRequest.status = AccessRequestStatus.REJECTED;
          await updateAccessRequest(tx, accessRequest);
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
    return await getAccessRequests(tx, req.currentContext.initiative as Initiative);
  });
  res.status(200).json(response);
};
