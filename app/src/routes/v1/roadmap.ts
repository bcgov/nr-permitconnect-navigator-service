import express from 'express';
import { z } from 'zod';

import { openapiRoute } from './openapiRoute.ts';
import { getRoadmapNoteController, sendRoadmapController } from '#src/controllers/roadmap';
import { hasAuthorization } from '#src/middleware/authorization';
import { hasIdentity } from '#src/middleware/identity';
import { requireSomeAuth } from '#src/middleware/requireSomeAuth';
import { requireSomeGroup } from '#src/middleware/requireSomeGroup';
import { Action, IdentityProviderKind, Resource } from '#src/utils/enums/application';
import { noteHistorySchema } from '#src/validators/schemas/noteHistorySchema';
import {
  FORBIDDEN_RESPONSE,
  UNAUTHORIZED_RESPONSE,
  VALIDATION_ERROR_RESPONSE
} from '#src/validators/schemas/problemResponseSchema';
import { schema } from '#src/validators/roadmap';

import type { Router } from 'express';

/**
 * Mounted separately per initiative, so basePath/tagPrefix are supplied by the caller rather
 * than hardcoded - keeps the registered OpenAPI path/tag accurate per mount point.
 * @param basePath - Mount path prefix (e.g. `/electrification/roadmap`).
 * @param tagPrefix - Initiative name prefixed onto the OpenAPI tag (e.g. `Electrification`).
 * @returns An Express router.
 */
export default function createRoadmapRouter(basePath: string, tagPrefix: string): Router {
  const router = express.Router();
  router.use(requireSomeAuth);
  router.use(hasIdentity(IdentityProviderKind.AZUREIDIR));
  router.use(requireSomeGroup);

  openapiRoute(basePath, router, {
    method: 'post',
    path: '/',
    summary: 'Send an email with the roadmap data',
    tags: [`${tagPrefix} Roadmap`],
    schema: schema.send,
    responses: {
      201: { description: 'The note history created for the sent roadmap', schema: noteHistorySchema },
      401: UNAUTHORIZED_RESPONSE,
      403: FORBIDDEN_RESPONSE,
      422: VALIDATION_ERROR_RESPONSE
    },
    middleware: [hasAuthorization(Resource.ROADMAP, Action.CREATE)],
    handler: sendRoadmapController
  });

  openapiRoute(basePath, router, {
    method: 'get',
    path: '/note',
    summary: 'Get the roadmap note for a project',
    tags: [`${tagPrefix} Roadmap`],
    schema: schema.getRoadmapNote,
    responses: {
      200: { description: 'The generated roadmap note text', schema: z.string() },
      401: UNAUTHORIZED_RESPONSE,
      403: FORBIDDEN_RESPONSE,
      422: VALIDATION_ERROR_RESPONSE
    },
    middleware: [hasAuthorization(Resource.ROADMAP, Action.READ)],
    handler: getRoadmapNoteController
  });

  return router;
}
