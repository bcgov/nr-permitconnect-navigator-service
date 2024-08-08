import { AccessRole } from '../utils/enums/application';
import { userService, accessRequestService } from '../services';

import type { NextFunction, Request, Response } from '../interfaces/IExpress';
import type { JwtPayload } from 'jsonwebtoken';
import type { AccessRequest, User, UserAccessRequest } from '../types';

const controller = {
  // Request to create user & access
  createUserAccessRevokeRequest: async (
    req: Request<never, never, { user: User; accessRequest: AccessRequest }>,
    res: Response,
    next: NextFunction
  ) => {
    // Check if the requestee is an admin
    const admin =
      (req.currentUser?.tokenPayload as JwtPayload)?.client_roles?.some(
        (role: string) => role === AccessRole.PCNS_DEVELOPER || role === AccessRole.PCNS_ADMIN
      ) ?? false;

    try {
      let response;
      const { user, accessRequest } = req.body;
      if (accessRequest?.grant === false) {
        response = await accessRequestService.createUserAccessRevokeRequest(accessRequest);
        res.status(200).json(response);
      } else {
        // Perform create request
        const userResponse = await userService.createUserIfNew(user);
        if (userResponse) {
          accessRequest.userId = userResponse.userId;
          response = userResponse as UserAccessRequest;
          if (!admin) response.accessRequest = await accessRequestService.createUserAccessRevokeRequest(accessRequest);
          else {
            // TODO: call put/role api to update role without access request
          }
          res.status(200).json(response);
        } else {
          // TODO check if the new user is a proponent

          if (admin) {
            // TODO: Call put/role to update role
          } else {
            // TODO: Put an entry in accessRequest table
          }
          // Send 409 if the user is not a proponent
          res.status(409).json({ message: 'User already exists' });
        }
      }
    } catch (e: unknown) {
      next(e);
    }
  },

  deleteAccessRequests: async (req: Request<{ accessRequestId: string }>, res: Response, next: NextFunction) => {
    try {
      const response = await accessRequestService.deleteAccessRequests(req.params.accessRequestId);
      res.status(200).json(response);
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
