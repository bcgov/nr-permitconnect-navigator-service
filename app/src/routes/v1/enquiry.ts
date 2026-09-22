import express from 'express';
import { z } from 'zod';

import { openapiRoute } from './openapiRoute.ts';
import {
  createEnquiryController,
  deleteEnquiryController,
  getEnquiryController,
  listEnquiriesController,
  listRelatedEnquiriesController,
  patchEnquiryController,
  searchEnquiriesController
} from '#src/controllers/enquiry';
import { hasAccess, hasAuthorization } from '#src/middleware/authorization';
import { requireSomeAuth } from '#src/middleware/requireSomeAuth';
import { requireSomeGroup } from '#src/middleware/requireSomeGroup';
import { Action, Resource } from '#src/utils/enums/application';
import { createEnquiryResponseSchema, enquirySchema } from '#src/schemas/response/enquiry';
import { FORBIDDEN_RESPONSE, UNAUTHORIZED_RESPONSE, VALIDATION_ERROR_RESPONSE } from '#src/schemas/response/problem';
import { schema } from '#src/schemas/request/enquiry';

import type { Router } from 'express';

/**
 * Mounted separately per initiative, so basePath/tagPrefix are supplied by the caller rather
 * than hardcoded - keeps the registered OpenAPI path/tag accurate per mount point.
 * @param basePath - Mount path prefix (e.g. `/electrification/enquiry`).
 * @param tagPrefix - Initiative name prefixed onto the OpenAPI tag (e.g. `Electrification`).
 * @returns An Express router.
 */
export default function createEnquiryRouter(basePath: string, tagPrefix: string): Router {
  const router = express.Router();
  router.use(requireSomeAuth);
  router.use(requireSomeGroup);

  openapiRoute(basePath, router, {
    method: 'get',
    path: '/list/:activityId',
    summary: 'Gets enquiries related to an activityId',
    tags: [`${tagPrefix} Enquiry`],
    responses: {
      200: { description: 'A list of enquiries related to the activity', schema: z.array(enquirySchema) },
      401: UNAUTHORIZED_RESPONSE,
      403: FORBIDDEN_RESPONSE
    },
    middleware: [hasAuthorization(Resource.ENQUIRY, Action.READ), hasAccess('activityId')],
    handler: listRelatedEnquiriesController
  });

  openapiRoute(basePath, router, {
    method: 'post',
    path: '/search',
    summary: 'Search all enquiries',
    tags: [`${tagPrefix} Enquiry`],
    schema: schema.searchEnquiries,
    responses: {
      200: { description: 'A list of enquiries matching the search criteria', schema: z.array(enquirySchema) },
      401: UNAUTHORIZED_RESPONSE,
      403: FORBIDDEN_RESPONSE,
      422: VALIDATION_ERROR_RESPONSE
    },
    middleware: [hasAuthorization(Resource.ENQUIRY, Action.READ)],
    handler: searchEnquiriesController
  });

  openapiRoute(basePath, router, {
    method: 'get',
    path: '/:enquiryId',
    summary: 'Gets a specific enquiry',
    tags: [`${tagPrefix} Enquiry`],
    schema: schema.getEnquiry,
    responses: {
      200: { description: 'The requested enquiry', schema: enquirySchema },
      401: UNAUTHORIZED_RESPONSE,
      403: FORBIDDEN_RESPONSE,
      422: VALIDATION_ERROR_RESPONSE
    },
    middleware: [hasAuthorization(Resource.ENQUIRY, Action.READ), hasAccess('enquiryId')],
    handler: getEnquiryController
  });

  openapiRoute(basePath, router, {
    method: 'get',
    path: '/',
    summary: 'Gets a list of enquiries',
    tags: [`${tagPrefix} Enquiry`],
    responses: {
      200: { description: 'A list of enquiries', schema: z.array(enquirySchema) },
      401: UNAUTHORIZED_RESPONSE,
      403: FORBIDDEN_RESPONSE
    },
    middleware: [hasAuthorization(Resource.ENQUIRY, Action.READ)],
    handler: listEnquiriesController
  });

  openapiRoute(basePath, router, {
    method: 'post',
    path: '/',
    summary: 'Creates an enquiry and set status to Submitted',
    tags: [`${tagPrefix} Enquiry`],
    schema: schema.createEnquiry,
    responses: {
      201: { description: 'The created enquiry', schema: createEnquiryResponseSchema },
      401: UNAUTHORIZED_RESPONSE,
      403: FORBIDDEN_RESPONSE,
      422: VALIDATION_ERROR_RESPONSE
    },
    middleware: [hasAuthorization(Resource.ENQUIRY, Action.CREATE)],
    handler: createEnquiryController
  });

  openapiRoute(basePath, router, {
    method: 'patch',
    path: '/:enquiryId',
    summary: 'Patches an enquiry',
    tags: [`${tagPrefix} Enquiry`],
    schema: schema.patchEnquiry,
    responses: {
      200: { description: 'The updated enquiry', schema: enquirySchema },
      401: UNAUTHORIZED_RESPONSE,
      403: FORBIDDEN_RESPONSE,
      422: VALIDATION_ERROR_RESPONSE
    },
    middleware: [hasAuthorization(Resource.ENQUIRY, Action.UPDATE), hasAccess('enquiryId')],
    handler: patchEnquiryController
  });

  openapiRoute(basePath, router, {
    method: 'delete',
    path: '/:enquiryId',
    summary: 'Deletes an enquiry',
    tags: [`${tagPrefix} Enquiry`],
    schema: schema.deleteEnquiry,
    responses: {
      204: { description: 'The enquiry was deleted' },
      401: UNAUTHORIZED_RESPONSE,
      403: FORBIDDEN_RESPONSE,
      422: VALIDATION_ERROR_RESPONSE
    },
    middleware: [hasAuthorization(Resource.ENQUIRY, Action.DELETE), hasAccess('enquiryId')],
    handler: deleteEnquiryController
  });

  return router;
}
