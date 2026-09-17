import express from 'express';
import { z } from 'zod';

import { openapiRoute } from './openapiRoute.ts';
import {
  deletePermitController,
  getPermitController,
  intakePermitsController,
  listPermitsController,
  searchPermitsController,
  upsertPermitController
} from '#src/controllers/permit';
import { hasAccess, hasAuthorization } from '#src/middleware/authorization';
import { requireSomeAuth } from '#src/middleware/requireSomeAuth';
import { requireSomeGroup } from '#src/middleware/requireSomeGroup';
import { Action, Resource } from '#src/utils/enums/application';
import { permitSchema, searchPermitsResponseSchema } from '#src/validators/schemas/permitSchema';
import {
  FORBIDDEN_RESPONSE,
  UNAUTHORIZED_RESPONSE,
  VALIDATION_ERROR_RESPONSE
} from '#src/validators/schemas/problemResponseSchema';
import { schema } from '#src/validators/permit';

import type { Router } from 'express';

/**
 * Mounted separately per initiative, so basePath/tagPrefix are supplied by the caller rather
 * than hardcoded - keeps the registered OpenAPI path/tag accurate per mount point.
 * @param basePath - Mount path prefix (e.g. `/electrification/permit`).
 * @param tagPrefix - Initiative name prefixed onto the OpenAPI tag (e.g. `Electrification`).
 * @returns An Express router.
 */
export default function createPermitRouter(basePath: string, tagPrefix: string): Router {
  const router = express.Router();
  router.use(requireSomeAuth);
  router.use(requireSomeGroup);

  openapiRoute(basePath, router, {
    method: 'get',
    path: '/',
    summary: 'Get a list of permits',
    tags: [`${tagPrefix} Permit`],
    schema: schema.listPermits,
    responses: {
      200: { description: 'A list of permits', schema: z.array(permitSchema) },
      401: UNAUTHORIZED_RESPONSE,
      403: FORBIDDEN_RESPONSE,
      422: VALIDATION_ERROR_RESPONSE
    },
    middleware: [hasAuthorization(Resource.PERMIT, Action.READ)],
    handler: listPermitsController
  });

  openapiRoute(basePath, router, {
    method: 'post',
    path: '/',
    summary: 'Create or update a permit',
    tags: [`${tagPrefix} Permit`],
    schema: schema.upsertPermit,
    responses: {
      200: { description: 'The created or updated permit', schema: permitSchema },
      401: UNAUTHORIZED_RESPONSE,
      403: FORBIDDEN_RESPONSE,
      422: VALIDATION_ERROR_RESPONSE
    },
    middleware: [hasAuthorization(Resource.PERMIT, Action.CREATE)],
    handler: upsertPermitController
  });

  openapiRoute(basePath, router, {
    method: 'delete',
    path: '/:permitId',
    summary: 'Delete a permit',
    tags: [`${tagPrefix} Permit`],
    schema: schema.deletePermit,
    responses: {
      204: { description: 'The permit was deleted' },
      401: UNAUTHORIZED_RESPONSE,
      403: FORBIDDEN_RESPONSE,
      422: VALIDATION_ERROR_RESPONSE
    },
    middleware: [hasAuthorization(Resource.PERMIT, Action.DELETE), hasAccess('permitId')],
    handler: deletePermitController
  });

  openapiRoute(basePath, router, {
    method: 'post',
    path: '/intake',
    summary: 'Create multiple permit records',
    tags: [`${tagPrefix} Permit`],
    schema: schema.intakePermit,
    responses: {
      201: { description: 'The created permits', schema: z.array(permitSchema) },
      401: UNAUTHORIZED_RESPONSE,
      403: FORBIDDEN_RESPONSE,
      422: VALIDATION_ERROR_RESPONSE
    },
    middleware: [hasAuthorization(Resource.PERMIT, Action.CREATE)],
    handler: intakePermitsController
  });

  openapiRoute(basePath, router, {
    method: 'get',
    path: '/search',
    summary: 'Get a list of permits based on search criteria',
    tags: [`${tagPrefix} Permit`],
    schema: schema.searchPermits,
    responses: {
      200: { description: 'Paginated permits matching the search criteria', schema: searchPermitsResponseSchema },
      401: UNAUTHORIZED_RESPONSE,
      403: FORBIDDEN_RESPONSE,
      422: VALIDATION_ERROR_RESPONSE
    },
    middleware: [hasAuthorization(Resource.PERMIT, Action.READ)],
    handler: searchPermitsController
  });

  openapiRoute(basePath, router, {
    method: 'get',
    path: '/:permitId',
    summary: 'Get a permit',
    tags: [`${tagPrefix} Permit`],
    schema: schema.getPermit,
    responses: {
      200: { description: 'The requested permit', schema: permitSchema },
      401: UNAUTHORIZED_RESPONSE,
      403: FORBIDDEN_RESPONSE,
      422: VALIDATION_ERROR_RESPONSE
    },
    middleware: [hasAuthorization(Resource.PERMIT, Action.READ), hasAccess('permitId')],
    handler: getPermitController
  });

  return router;
}
