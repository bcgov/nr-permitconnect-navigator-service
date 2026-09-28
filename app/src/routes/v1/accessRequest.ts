import express from 'express';
import { z } from 'zod';

import { openapiRoute } from './openapiRoute.ts';
import {
  createUserAccessRequestController,
  getAccessRequestsController,
  processUserAccessRequestController
} from '#src/controllers/accessRequest';
import { hasAuthorization } from '#src/middleware/authorization';
import { hasIdentity } from '#src/middleware/identity';
import { requireSomeAuth } from '#src/middleware/requireSomeAuth';
import { requireSomeGroup } from '#src/middleware/requireSomeGroup';
import { Action, IdentityProviderKind, Resource } from '#src/utils/enums/application';
import { accessRequestSchema } from '#src/schemas/response/accessRequest';
import { FORBIDDEN_RESPONSE, UNAUTHORIZED_RESPONSE, VALIDATION_ERROR_RESPONSE } from '#src/schemas/response/problem';
import { schema } from '#src/schemas/request/accessRequest';

import type { Router } from 'express';

// createAccessRequestService's admin-path branches return a partial mock object instead of a
// full access_request row - see src/services/accessRequest.ts.
const accessRequestGrantResultSchema = z.object({
  userId: z.string(),
  grant: z.boolean(),
  groupId: z.number().nullish(),
  status: z.enum(['Approved', 'Pending', 'Rejected'])
});

/**
 * Mounted separately per initiative, so basePath/tagPrefix are supplied by the caller rather
 * than hardcoded - keeps the registered OpenAPI path/tag accurate per mount point.
 * @param basePath - Mount path prefix (e.g. `/electrification/access-request`).
 * @param tagPrefix - Initiative name prefixed onto the OpenAPI tag (e.g. `Electrification`).
 * @returns An Express router.
 */
export default function createAccessRequestRouter(basePath: string, tagPrefix: string): Router {
  const router = express.Router();
  router.use(requireSomeAuth);
  router.use(hasIdentity(IdentityProviderKind.AZUREIDIR));
  router.use(requireSomeGroup);

  openapiRoute(basePath, router, {
    method: 'post',
    path: '/',
    summary: 'Request to create/revoke a user and access request',
    tags: [`${tagPrefix} Access Request`],
    schema: schema.createUserAccessRequest,
    responses: {
      200: {
        description: 'The access request was actioned immediately (caller is an admin, grant)',
        schema: accessRequestGrantResultSchema
      },
      201: { description: 'The created access request, pending approval', schema: accessRequestSchema },
      204: { description: 'The access request was revoked immediately (caller is an admin, revoke)' },
      401: UNAUTHORIZED_RESPONSE,
      403: FORBIDDEN_RESPONSE,
      422: VALIDATION_ERROR_RESPONSE
    },
    middleware: [hasAuthorization(Resource.ACCESS_REQUEST, Action.CREATE)],
    handler: createUserAccessRequestController
  });

  openapiRoute(basePath, router, {
    method: 'post',
    path: '/:accessRequestId',
    summary: 'Process an access request',
    tags: [`${tagPrefix} Access Request`],
    schema: schema.processUserAccessRequest,
    responses: {
      204: { description: 'The access request was processed' },
      401: UNAUTHORIZED_RESPONSE,
      403: FORBIDDEN_RESPONSE,
      422: VALIDATION_ERROR_RESPONSE
    },
    middleware: [hasAuthorization(Resource.ACCESS_REQUEST, Action.UPDATE)],
    handler: processUserAccessRequestController
  });

  openapiRoute(basePath, router, {
    method: 'get',
    path: '/',
    summary: 'Get access requests',
    tags: [`${tagPrefix} Access Request`],
    responses: {
      200: { description: 'A list of access requests', schema: z.array(accessRequestSchema) },
      401: UNAUTHORIZED_RESPONSE,
      403: FORBIDDEN_RESPONSE
    },
    middleware: [hasAuthorization(Resource.ACCESS_REQUEST, Action.READ)],
    handler: getAccessRequestsController
  });

  return router;
}
