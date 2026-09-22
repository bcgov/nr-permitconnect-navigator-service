import express from 'express';
import { z } from 'zod';

import { openapiRoute } from './openapiRoute.ts';
import {
  createNoteHistoryController,
  deleteNoteHistoryController,
  listBringForwardsController,
  listNoteHistoriesController,
  patchNoteHistoryController
} from '#src/controllers/noteHistory';
import { hasAccess, hasAuthorization } from '#src/middleware/authorization';
import { requireSomeAuth } from '#src/middleware/requireSomeAuth';
import { requireSomeGroup } from '#src/middleware/requireSomeGroup';
import { Action, Resource } from '#src/utils/enums/application';
import { bringForwardSchema, noteHistorySchema } from '#src/schemas/response/noteHistory';
import { FORBIDDEN_RESPONSE, UNAUTHORIZED_RESPONSE, VALIDATION_ERROR_RESPONSE } from '#src/schemas/response/problem';
import { schema } from '#src/schemas/request/noteHistory';

import type { Router } from 'express';

/**
 * Mounted separately per initiative, so basePath/tagPrefix are supplied by the caller rather
 * than hardcoded - keeps the registered OpenAPI path/tag accurate per mount point.
 * @param basePath - Mount path prefix (e.g. `/electrification/note`).
 * @param tagPrefix - Initiative name prefixed onto the OpenAPI tag (e.g. `Electrification`).
 * @returns An Express router.
 */
export default function createNoteHistoryRouter(basePath: string, tagPrefix: string): Router {
  const router = express.Router();
  router.use(requireSomeAuth);
  router.use(requireSomeGroup);

  openapiRoute(basePath, router, {
    method: 'post',
    path: '/',
    summary: 'Create a note history',
    tags: [`${tagPrefix} Note`],
    schema: schema.createNoteHistory,
    responses: {
      201: { description: 'The created note history', schema: noteHistorySchema },
      401: UNAUTHORIZED_RESPONSE,
      403: FORBIDDEN_RESPONSE,
      422: VALIDATION_ERROR_RESPONSE
    },
    middleware: [hasAuthorization(Resource.NOTE, Action.CREATE)],
    handler: createNoteHistoryController
  });

  openapiRoute(basePath, router, {
    method: 'patch',
    path: '/:noteHistoryId',
    summary: 'Patch a note history',
    tags: [`${tagPrefix} Note`],
    schema: schema.patchNoteHistory,
    responses: {
      200: { description: 'The updated note history', schema: noteHistorySchema },
      401: UNAUTHORIZED_RESPONSE,
      403: FORBIDDEN_RESPONSE,
      422: VALIDATION_ERROR_RESPONSE
    },
    middleware: [hasAuthorization(Resource.NOTE, Action.UPDATE), hasAccess('noteHistoryId')],
    handler: patchNoteHistoryController
  });

  openapiRoute(basePath, router, {
    method: 'delete',
    path: '/:noteHistoryId',
    summary: 'Delete a note history',
    tags: [`${tagPrefix} Note`],
    schema: schema.deleteNoteHistory,
    responses: {
      204: { description: 'The note history was deleted' },
      401: UNAUTHORIZED_RESPONSE,
      403: FORBIDDEN_RESPONSE,
      422: VALIDATION_ERROR_RESPONSE
    },
    middleware: [hasAuthorization(Resource.NOTE, Action.DELETE), hasAccess('noteHistoryId')],
    handler: deleteNoteHistoryController
  });

  openapiRoute(basePath, router, {
    method: 'get',
    path: '/bring-forward',
    summary: 'Get a list of bring forward note histories',
    tags: [`${tagPrefix} Note`],
    schema: schema.listBringForwards,
    responses: {
      200: { description: 'A list of bring forward note histories', schema: z.array(bringForwardSchema) },
      401: UNAUTHORIZED_RESPONSE,
      403: FORBIDDEN_RESPONSE,
      422: VALIDATION_ERROR_RESPONSE
    },
    middleware: [hasAuthorization(Resource.NOTE, Action.READ)],
    handler: listBringForwardsController
  });

  openapiRoute(basePath, router, {
    method: 'get',
    path: '/list/:activityId',
    summary: 'Get a list of note histories',
    tags: [`${tagPrefix} Note`],
    schema: schema.listNoteHistory,
    responses: {
      200: { description: 'A list of note histories for the activity', schema: z.array(noteHistorySchema) },
      401: UNAUTHORIZED_RESPONSE,
      403: FORBIDDEN_RESPONSE,
      422: VALIDATION_ERROR_RESPONSE
    },
    middleware: [hasAuthorization(Resource.NOTE, Action.READ)],
    handler: listNoteHistoriesController
  });

  return router;
}
