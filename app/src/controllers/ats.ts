import { createATSClient, createATSEnquiry, searchATSUsers } from '../services/ats';
import { getCurrentUsername } from '../utils/utils';

import type { Request, Response } from 'express';
import type { ATSClientResource, ATSEnquiryResource, ATSUserSearchParameters } from '../types';

export const searchATSUsersController = async (
  req: Request<never, never, never, ATSUserSearchParameters>,
  res: Response
) => {
  const response = await searchATSUsers(req.query);

  res.status(response.status).json(response.data);
};

export const createATSClientController = async (
  req: Request<never, never, ATSClientResource, never>,
  res: Response
) => {
  const identityProvider = req.currentContext?.tokenPayload?.identity_provider.toUpperCase();
  const atsClient = req.body;
  // Set the createdBy field to current user with \\ as the separator for the domain and username to match ATS DB
  atsClient.createdBy = `${identityProvider}\\${getCurrentUsername(req.currentContext)}`;
  const response = await createATSClient(atsClient);
  res.status(response.status).json(response.data);
};

export const createATSEnquiryController = async (
  req: Request<never, never, ATSEnquiryResource, never>,
  res: Response
) => {
  const identityProvider = req.currentContext?.tokenPayload?.identity_provider.toUpperCase();
  const atsEnquiry = req.body;
  // Set the createdBy field to current user with \\ as the separator for the domain and username to match ATS DB
  atsEnquiry.createdBy = `${identityProvider}\\${getCurrentUsername(req.currentContext)}`;
  const response = await createATSEnquiry(atsEnquiry);
  res.status(response.status).json(response.data);
};
