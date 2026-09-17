import express from 'express';

import { openapiRoute } from './openapiRoute.ts';
import { createDocumentController, deleteDocumentController, listDocumentsController } from '#src/controllers/document';
import { hasAccess, hasAuthorization } from '#src/middleware/authorization';
import { requireSomeAuth } from '#src/middleware/requireSomeAuth';
import { requireSomeGroup } from '#src/middleware/requireSomeGroup';
import { Action, Resource } from '#src/utils/enums/application';
import { documentSchema } from '#src/validators/schemas/documentSchema';
import {
  FORBIDDEN_RESPONSE,
  UNAUTHORIZED_RESPONSE,
  VALIDATION_ERROR_RESPONSE
} from '#src/validators/schemas/problemResponseSchema';
import { schema } from '#src/validators/document';

import type { Router } from 'express';

/**
 * Mounted separately per initiative, so basePath/tagPrefix are supplied by the caller rather
 * than hardcoded - keeps the registered OpenAPI path/tag accurate per mount point.
 * @param basePath - Mount path prefix (e.g. `/electrification/document`).
 * @param tagPrefix - Initiative name prefixed onto the OpenAPI tag (e.g. `Electrification`).
 * @returns An Express router.
 */
export default function createDocumentRouter(basePath: string, tagPrefix: string): Router {
  const router = express.Router();
  router.use(requireSomeAuth);
  router.use(requireSomeGroup);

  openapiRoute(basePath, router, {
    method: 'post',
    path: '/',
    summary: 'Create a document',
    tags: [`${tagPrefix} Document`],
    schema: schema.createDocument,
    responses: {
      201: { description: 'The created document', schema: documentSchema },
      401: UNAUTHORIZED_RESPONSE,
      403: FORBIDDEN_RESPONSE,
      422: VALIDATION_ERROR_RESPONSE
    },
    middleware: [hasAuthorization(Resource.DOCUMENT, Action.CREATE)],
    handler: createDocumentController
  });

  openapiRoute(basePath, router, {
    method: 'delete',
    path: '/:documentId',
    summary: 'Delete a document',
    tags: [`${tagPrefix} Document`],
    schema: schema.deleteDocument,
    responses: {
      204: { description: 'The document was deleted' },
      401: UNAUTHORIZED_RESPONSE,
      403: FORBIDDEN_RESPONSE,
      422: VALIDATION_ERROR_RESPONSE
    },
    middleware: [hasAuthorization(Resource.DOCUMENT, Action.DELETE), hasAccess('documentId')],
    handler: deleteDocumentController
  });

  openapiRoute(basePath, router, {
    method: 'get',
    path: '/list/:activityId',
    summary: 'Get a list of documents',
    tags: [`${tagPrefix} Document`],
    schema: schema.listDocuments,
    responses: {
      200: { description: 'A list of documents for the activity', schema: documentSchema.array() },
      401: UNAUTHORIZED_RESPONSE,
      403: FORBIDDEN_RESPONSE,
      422: VALIDATION_ERROR_RESPONSE
    },
    middleware: [hasAuthorization(Resource.DOCUMENT, Action.READ)],
    handler: listDocumentsController
  });

  return router;
}
