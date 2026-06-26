import { Prisma } from '@prisma/client';

import {
  createEnquiryService,
  deleteEnquiryService,
  getEnquiryService,
  listEnquiriesService,
  listRelatedEnquiriesService,
  searchEnquiriesService,
  updateEnquiryService
} from '../services/enquiry.ts';
import { isTruthy } from '../utils/utils.ts';

import type { Request, Response } from 'express';
import type { Enquiry, EnquiryIntake, EnquirySearchParameters, LocalContext } from '../types/index.ts';

export const createEnquiryController = async (
  req: Request<never, never, EnquiryIntake>,
  res: Response<Enquiry, LocalContext>
) => {
  // Provide an empty body if POST body is given undefined
  req.body ??= {} as EnquiryIntake;

  const response = await createEnquiryService(res.locals.currentContext, req.body);
  res.status(201).json(response);
};

export const deleteEnquiryController = async (req: Request<{ enquiryId: string }>, res: Response) => {
  await deleteEnquiryService(req.params.enquiryId);
  res.status(204).end();
};

export const getEnquiryController = async (req: Request<{ enquiryId: string }>, res: Response) => {
  const response = await getEnquiryService(req.params.enquiryId);
  res.status(200).json(response);
};

export const listEnquiriesController = async (_req: Request, res: Response<Enquiry[], LocalContext>) => {
  const response = await listEnquiriesService(res.locals.currentAuthorization, res.locals.currentContext);
  res.status(200).json(response);
};

export const listRelatedEnquiriesController = async (
  req: Request<{ activityId: string }>,
  res: Response<Enquiry[], LocalContext>
) => {
  const response = await listRelatedEnquiriesService(
    res.locals.currentAuthorization,
    res.locals.currentContext,
    req.params.activityId
  );

  res.status(200).json(response);
};

export const searchEnquiriesController = async (
  req: Request<never, never, EnquirySearchParameters | undefined, never>,
  res: Response<Enquiry[], LocalContext>
) => {
  const response = await searchEnquiriesService(
    res.locals.currentAuthorization,
    res.locals.currentContext,
    {
      ...req.body,
      includeUser: isTruthy(req.body?.includeUser)
    },
    res.locals.currentContext.initiative
  );
  res.status(200).json(response);
};

export const updateEnquiryController = async (
  req: Request<{ enquiryId: string }, never, Omit<Prisma.enquiryUpdateInput, 'enquiryId'>>,
  res: Response
) => {
  const response = await updateEnquiryService(req.body, req.params.enquiryId);
  res.status(200).json(response);
};
