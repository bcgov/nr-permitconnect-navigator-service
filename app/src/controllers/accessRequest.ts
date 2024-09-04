import { AccessRequestStatus, GroupName, IdentityProvider, Initiative } from '../utils/enums/application';
import { userService, accessRequestService, yarsService } from '../services';

import type { NextFunction, Request, Response } from '../interfaces/IExpress';
import type { AccessRequest, User } from '../types';

const controller = {
  // Request to create user & access
  createUserAccessRequest: async (
    req: Request<never, never, { accessRequest: AccessRequest; user: User }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { accessRequest, user } = req.body;

      let userResponse;

      if (user) userResponse = await userService.createUserIfNew(user);
      else userResponse = await userService.readUser(accessRequest.userId as string);

      let groups: Array<{
        initiativeId?: string;
        groupId?: number;
        groupName: GroupName;
      }> = [];

      if (!userResponse) {
        res.status(404).json({ message: 'User does not exist' });
      } else {
        groups = await yarsService.getSubjectGroups(userResponse.sub);

        if (accessRequest.grant && (!accessRequest.group || !accessRequest.group.length)) {
          res.status(422).json({ message: 'Must provided a role to grant' });
        }
        if (accessRequest.group && groups.map((x) => x.groupName).includes(accessRequest.group)) {
          res.status(409).json({ message: 'User is already assigned this role' });
        }
        if (userResponse.idp !== IdentityProvider.IDIR) {
          res.status(409).json({ message: 'User must be an IDIR user to be assigned this role' });
        }
      }

      // Check if the requestee is an admin
      const admin =
        req.currentAuthorization?.groups.some(
          (group: GroupName) => group === GroupName.DEVELOPER || group === GroupName.ADMIN
        ) ?? false;

      let response;

      if (admin) {
        if (accessRequest.grant) {
          await yarsService.assignGroup(
            req.currentContext.bearerToken,
            user.sub,
            req.currentContext?.initiative as Initiative,
            accessRequest.group as GroupName
          );
          // Mock an access request for the response
          response = {
            userId: accessRequest.userId,
            grant: accessRequest.grant,
            group: accessRequest.group,
            status: AccessRequestStatus.APPROVED
          };
        } else {
          // Remove requested group if provided - otherwise remove all user groups
          const groupsToRemove = accessRequest.group ? [{ groupName: accessRequest.group }] : groups;
          for (const g of groupsToRemove) {
            let initiative = req.currentContext?.initiative as Initiative;
            if (g.groupName === GroupName.DEVELOPER) {
              initiative = Initiative.PCNS;
            }

            response = await yarsService.removeGroup(userResponse?.sub as string, initiative, g.groupName);
          }
        }
      } else {
        response = await accessRequestService.createUserAccessRequest({
          ...accessRequest,
          userId: userResponse?.userId as string
        });
      }

      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  processUserAccessRequest: async (
    req: Request<{ accessRequestId: string }, never, { approve: boolean }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const accessRequest = await accessRequestService.getAccessRequest(req.params.accessRequestId);

      if (accessRequest) {
        const userResponse = await userService.readUser(accessRequest.userId);

        if (userResponse) {
          const groups: Array<{
            initiativeId?: string;
            groupId?: number;
            groupName: GroupName;
          }> = await yarsService.getSubjectGroups(userResponse.sub);

          // If request is approved then grant or remove access
          if (req.body.approve) {
            if (accessRequest.grant) {
              if (!accessRequest.group || !accessRequest.group.length) {
                res.status(422).json({ message: 'Must provided a role to grant' });
              }
              if (accessRequest.group && groups.map((x) => x.groupName).includes(accessRequest.group)) {
                res.status(409).json({ message: 'User is already assigned this role' });
              }
              if (userResponse.idp !== IdentityProvider.IDIR) {
                res.status(409).json({ message: 'User must be an IDIR user to be assigned this role' });
              }

              await yarsService.assignGroup(
                undefined,
                userResponse.sub,
                req.currentContext?.initiative as Initiative,
                accessRequest.group as GroupName
              );
            } else {
              // Remove requested group if provided - otherwise remove all user groups
              const groupsToRemove = accessRequest.group ? [{ groupName: accessRequest.group }] : groups;
              for (const g of groupsToRemove) {
                let initiative = req.currentContext?.initiative as Initiative;
                if (g.groupName === GroupName.DEVELOPER) {
                  initiative = Initiative.PCNS;
                }

                await yarsService.removeGroup(userResponse.sub, initiative, g.groupName);
              }
            }
          }

          // Delete the request after processing
          await accessRequestService.deleteAccessRequest(accessRequest.accessRequestId);
        } else {
          res.status(404).json({ message: 'User does not exist' });
        }

        res.status(204).end();
      }
    } catch (e: unknown) {
      next(e);
    }
  },

  getAccessRequests: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await accessRequestService.getAccessRequests();
      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  }
};

export default controller;
