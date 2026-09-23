import express from 'express';
import { z } from 'zod';

import { openapiRoute } from './openapiRoute.ts';
import { getPidsController } from '#src/controllers/map';
import { hasAuthorization } from '#src/middleware/authorization';
import { requireSomeAuth } from '#src/middleware/requireSomeAuth';
import { requireSomeGroup } from '#src/middleware/requireSomeGroup';
import { Action, Initiative, Resource } from '#src/utils/enums/application';
import { FORBIDDEN_RESPONSE, UNAUTHORIZED_RESPONSE, VALIDATION_ERROR_RESPONSE } from '#src/schemas/response/problem';
import { schema } from '#src/schemas/request/map';

import type { NextFunction, Request, Response, Router } from 'express';

const INITIATIVE_RESOURCE_MAP = new Map<Initiative, Resource>([
  [Initiative.GENERAL, Resource.GENERAL_PROJECT],
  [Initiative.HOUSING, Resource.HOUSING_PROJECT]
]);

/**
 * Mounted separately per initiative (General, Housing - not Electrification), so basePath/
 * tagPrefix are supplied by the caller rather than hardcoded.
 * @param basePath - Mount path prefix (e.g. `/general/map`).
 * @param tagPrefix - Initiative name prefixed onto the OpenAPI tag (e.g. `General`).
 * @returns An Express router.
 */
export default function createMapRouter(basePath: string, tagPrefix: string): Router {
  const router = express.Router();
  router.use(requireSomeAuth);
  router.use(requireSomeGroup);

  openapiRoute(basePath, router, {
    method: 'get',
    path: '/pids/:projectId',
    summary: 'Get PIDs for a project',
    tags: [`${tagPrefix} Map`],
    schema: schema.getPids,
    responses: {
      200: { description: 'The PIDs for the project', schema: z.string() },
      204: { description: 'No PIDs found for the project' },
      401: UNAUTHORIZED_RESPONSE,
      403: FORBIDDEN_RESPONSE,
      422: VALIDATION_ERROR_RESPONSE
    },
    middleware: [
      async (req: Request, res: Response, next: NextFunction) => {
        const resource = INITIATIVE_RESOURCE_MAP.get(res.locals.currentContext.initiative);
        if (!resource) {
          throw new Error('No resource');
        }
        return hasAuthorization(resource, Action.READ)(req, res, next);
      }
    ],
    handler: getPidsController
  });

  return router;
}
