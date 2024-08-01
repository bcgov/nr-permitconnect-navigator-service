import { userService, accessRequestService } from '../services';

import type { NextFunction, Request, Response } from 'express';

import type { UserAccessRequest } from '../types';

const controller = {
  // Request to create user & access
  createUserAccessRevokeRequest: async (req: Request, res: Response, next: NextFunction) => {
    // TODO check if the calling user is a supervisor or an admin
    try {
      let response;
      const { user, accessRequest } = req.body;
      if (accessRequest?.grant === false) {
        response = await accessRequestService.createUserAccessRevokeRequest(accessRequest);
        res.status(201).json(response);
      } else {
        const userResponse = await userService.createUserIfNew(user);
        if (userResponse) {
          accessRequest.userId = userResponse.userId;
          response = userResponse as UserAccessRequest;
          response.accessRequest = await accessRequestService.createUserAccessRevokeRequest(accessRequest);
          res.status(201).json(response);
        } else {
          // TODO check if the user is a proponent
          // Put an entry in accessRequest table
          // Send 409 if the user is not a proponent
          res.status(409).json({ message: 'User already exists' });
        }
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
