import {
  createUserAccessRequest,
  getAccessRequest,
  getAccessRequests,
  updateAccessRequest
} from '../services/accessRequest';
import { getInitiative } from '../services/initiative';
import { createUser, readUser } from '../services/user';
import { assignGroup, getGroups, getSubjectGroups, removeGroup } from '../services/yars';
import { AccessRequestStatus, GroupName, IdentityProvider, Initiative } from '../utils/enums/application';

import type { Request, Response } from 'express';
import type { AccessRequest, Group, User } from '../types';

// Request to create user & access
export const createUserAccessRequestController = async (
  req: Request<never, never, { accessRequest: AccessRequest; user: User }>,
  res: Response
) => {
  const { accessRequest, user } = req.body;

  // Check if the requestee is an admin
  const initiative = await getInitiative(req.currentContext.initiative as Initiative);
  const isAdmin =
    req.currentAuthorization?.groups.some(
      (group: Group) =>
        group.name === GroupName.DEVELOPER ||
        (group.name === GroupName.ADMIN && group.initiativeId === initiative.initiativeId)
    ) ?? false;

  // Groups the current user can modify
  const groups = await getGroups(req.currentContext.initiative as Initiative);
  const requestedGroup = groups.find((x) => x.groupId === accessRequest.groupId);
  const userAllowedGroups = [GroupName.NAVIGATOR, GroupName.NAVIGATOR_READ_ONLY];
  if (isAdmin) {
    userAllowedGroups.unshift(GroupName.ADMIN, GroupName.SUPERVISOR);
  }
  const modifiableGroups = groups.filter((x) => userAllowedGroups.includes(x.name));

  let userResponse;
  const existingUser = !!user.userId;

  if (!user.userId) userResponse = await createUser(user);
  else userResponse = await readUser(user.userId);

  let accessUserGroups: Array<Group> = [];

  if (!userResponse) {
    res.status(404).json({ message: 'User not found' });
  } else {
    accessUserGroups = await getSubjectGroups(userResponse.sub);
    const userInitiativeGroups = accessUserGroups.filter((x) => x.initiativeId === requestedGroup?.initiativeId);

    if (accessRequest.grant && !modifiableGroups.some((x) => x.groupId == accessRequest.groupId)) {
      res.status(403).json({ message: 'Cannot modify requested group' });
    }
    if (!accessRequest.update && userInitiativeGroups.length) {
      return res.status(409).json({ message: 'User already exists' });
    }
    if (
      accessRequest.grant &&
      accessRequest.groupId &&
      accessUserGroups.map((x) => x.groupId).includes(accessRequest.groupId)
    ) {
      res.status(409).json({ message: 'User is already assigned this group' });
    }
    if (userResponse.idp !== IdentityProvider.IDIR) {
      res.status(409).json({ message: 'User must be an IDIR user to be assigned this group' });
    }
    if (accessRequest.grant && !accessRequest.groupId) {
      res.status(422).json({ message: 'Must provide a group to grant' });
    }
  }

  const isGroupUpdate = existingUser && accessRequest.grant;
  let response;

  if (isGroupUpdate) {
    // Remove all user groups for initiative
    const groupsToRemove = accessUserGroups.filter((x) => x.initiativeId === requestedGroup?.initiativeId);
    for (const g of groupsToRemove) {
      response = await removeGroup(userResponse?.sub as string, g.groupId);
    }

    // Assign new group
    await assignGroup(req.currentContext.bearerToken, user.sub, accessRequest.groupId);

    // Mock an access request for the response
    response = {
      userId: userResponse?.userId,
      grant: accessRequest.grant,
      groupId: accessRequest.groupId,
      status: AccessRequestStatus.APPROVED
    };
  } else if (isAdmin) {
    if (accessRequest.grant) {
      await assignGroup(req.currentContext.bearerToken, user.sub, accessRequest.groupId);
      // Mock an access request for the response
      response = {
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
        response = await removeGroup(userResponse?.sub as string, groupId);
      }
    }
  } else {
    response = await createUserAccessRequest({
      ...accessRequest,
      userId: userResponse?.userId as string
    });
  }

  res.status(isAdmin ? 200 : 201).json(response);
};

export const processUserAccessRequestController = async (
  req: Request<{ accessRequestId: string }, never, { approve: boolean }>,
  res: Response
) => {
  const accessRequest = await getAccessRequest(req.currentContext.initiative as Initiative, req.params.accessRequestId);

  if (accessRequest) {
    const userResponse = await readUser(accessRequest.userId);

    if (userResponse) {
      const groups = await getGroups(req.currentContext.initiative as Initiative);
      const requestedGroup = groups.find((x) => x.groupId === accessRequest.groupId);

      const userGroups: Array<Group> = await getSubjectGroups(userResponse.sub);

      // If request is approved then grant or remove access
      if (req.body.approve) {
        if (accessRequest.grant) {
          if (!accessRequest.groupId) {
            return res.status(422).json({ message: 'Must provided a role to grant' });
          }
          if (accessRequest.groupId && userGroups.map((x) => x.groupId).includes(accessRequest.groupId)) {
            return res.status(409).json({ message: 'User is already assigned this role' });
          }
          if (userResponse.idp !== IdentityProvider.IDIR) {
            return res.status(409).json({ message: 'User must be an IDIR user to be assigned this role' });
          }

          await assignGroup(undefined, userResponse.sub, accessRequest.groupId);
        } else {
          // Remove requested group if provided - otherwise remove all user groups for initiative
          const groupsToRemove = accessRequest.groupId
            ? [accessRequest.groupId]
            : userGroups.filter((x) => x.initiativeId === requestedGroup?.initiativeId).map((x) => x.groupId);
          for (const groupId of groupsToRemove) {
            await removeGroup(userResponse.sub, groupId);
          }
        }

        // Update access request status
        accessRequest.status = AccessRequestStatus.APPROVED;
        await updateAccessRequest(accessRequest);
      } else {
        accessRequest.status = AccessRequestStatus.REJECTED;
        await updateAccessRequest(accessRequest);
      }
    } else {
      return res.status(404).json({ message: 'User does not exist' });
    }
    res.status(204).end();
  }
};

export const getAccessRequestsController = async (req: Request, res: Response) => {
  const response = await getAccessRequests(req.currentContext.initiative as Initiative);
  res.status(200).json(response);
};
