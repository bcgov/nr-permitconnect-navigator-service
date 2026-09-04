import { deleteActivityService } from '#src/services/activity';
import {
  createEnquiryService,
  getEnquiryService,
  listEnquiriesService,
  patchEnquiryService,
  listRelatedEnquiriesService,
  searchEnquiriesService
} from '#src/services/enquiry';

import type { Request, Response } from 'express';
import type {
  CreateEnquiryRequest,
  CreateEnquiryResponse,
  Enquiry,
  LocalContext,
  PatchEnquiryRequest,
  SearchEnquiriesRequest
} from '#types';

export const createEnquiryController = async (
  req: Request<never, never, CreateEnquiryRequest>,
  res: Response<CreateEnquiryResponse, LocalContext>
) => {
  const response = await createEnquiryService(res.locals.currentContext, req.body);
  res.status(201).json(response);
};

export const deleteEnquiryController = async (req: Request<{ enquiryId: string }>, res: Response) => {
  const project = await getEnquiryService(req.params.enquiryId);
  await deleteActivityService(project.activityId);
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
  req: Request<never, never, SearchEnquiriesRequest, never>,
  res: Response<Enquiry[], LocalContext>
) => {
  const response = await searchEnquiriesService(
    res.locals.currentAuthorization,
    res.locals.currentContext,
    {
      ...req.body,
      includeUser: req.body.includeUser
    },
    res.locals.currentContext.initiative
  );
  res.status(200).json(response);
};

export const patchEnquiryController = async (
  req: Request<{ enquiryId: string }, never, PatchEnquiryRequest>,
  res: Response
) => {
  const response = await patchEnquiryService(req.params.enquiryId, req.body);
  res.status(200).json(response);
};
