import express from 'express';
import { z } from 'zod';

import { openapiRoute } from './openapiRoute.ts';
import {
  createElectrificationProjectController,
  deleteElectrificationProjectController,
  deleteElectrificationProjectDraftController,
  getElectrificationProjectController,
  getElectrificationProjectDraftController,
  getElectrificationProjectDraftsController,
  getElectrificationProjectStatisticsController,
  listElectrificationProjectActivityIdsController,
  listElectrificationProjectsController,
  patchElectrificationProjectController,
  searchElectrificationProjectsController,
  submitElectrificationProjectDraftController,
  upsertElectrificationProjectDraftController
} from '#src/controllers/electrificationProject';
import { hasAccess, hasAuthorization } from '#src/middleware/authorization';
import { requireSomeAuth } from '#src/middleware/requireSomeAuth';
import { requireSomeGroup } from '#src/middleware/requireSomeGroup';
import { Action, Resource } from '#src/utils/enums/application';
import { draftSchema } from '#src/schemas/response/draft';
import { electrificationProjectSchema } from '#src/schemas/response/electrificationProject';
import { electrificationProjectStatisticsSchema } from '#src/schemas/response/projectStatistics';
import { FORBIDDEN_RESPONSE, UNAUTHORIZED_RESPONSE, VALIDATION_ERROR_RESPONSE } from '#src/schemas/response/problem';
import { schema } from '#src/schemas/request/electrificationProject';

const basePath = '/electrification/project';
const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

const TAGS = ['Electrification Project'];

openapiRoute(basePath, router, {
  method: 'get',
  path: '/',
  summary: 'Gets a list of electrification projects',
  tags: TAGS,
  responses: {
    200: { description: 'A list of electrification projects', schema: z.array(electrificationProjectSchema) },
    401: UNAUTHORIZED_RESPONSE,
    403: FORBIDDEN_RESPONSE
  },
  middleware: [hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.READ)],
  handler: listElectrificationProjectsController
});

openapiRoute(basePath, router, {
  method: 'get',
  path: '/activityIds',
  summary: 'Get a list of all the activityIds',
  tags: TAGS,
  responses: {
    200: { description: 'A list of activity IDs', schema: z.array(z.string()) },
    401: UNAUTHORIZED_RESPONSE,
    403: FORBIDDEN_RESPONSE
  },
  middleware: [hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.READ)],
  handler: listElectrificationProjectActivityIdsController
});

openapiRoute(basePath, router, {
  method: 'post',
  path: '/search',
  summary: 'Search electrification projects',
  tags: TAGS,
  schema: schema.searchElectrificationProjects,
  responses: {
    200: {
      description: 'A list of electrification projects matching the search criteria',
      schema: z.array(electrificationProjectSchema)
    },
    401: UNAUTHORIZED_RESPONSE,
    403: FORBIDDEN_RESPONSE,
    422: VALIDATION_ERROR_RESPONSE
  },
  middleware: [hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.READ)],
  handler: searchElectrificationProjectsController
});

openapiRoute(basePath, router, {
  method: 'get',
  path: '/statistics',
  summary: 'Gets electrification project statistics',
  tags: TAGS,
  schema: schema.getStatistics,
  responses: {
    200: { description: 'Electrification project statistics', schema: electrificationProjectStatisticsSchema },
    401: UNAUTHORIZED_RESPONSE,
    403: FORBIDDEN_RESPONSE,
    422: VALIDATION_ERROR_RESPONSE
  },
  middleware: [hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.READ)],
  handler: getElectrificationProjectStatisticsController
});

openapiRoute(basePath, router, {
  method: 'get',
  path: '/draft/:draftId',
  summary: 'Gets a electrification project draft',
  tags: TAGS,
  responses: {
    200: { description: 'The requested draft', schema: draftSchema },
    401: UNAUTHORIZED_RESPONSE,
    403: FORBIDDEN_RESPONSE
  },
  middleware: [hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.READ), hasAccess('draftId')],
  handler: getElectrificationProjectDraftController
});

openapiRoute(basePath, router, {
  method: 'get',
  path: '/draft',
  summary: 'Gets a list of electrification project drafts',
  tags: TAGS,
  responses: {
    200: { description: 'A list of electrification project drafts', schema: z.array(draftSchema) },
    401: UNAUTHORIZED_RESPONSE,
    403: FORBIDDEN_RESPONSE
  },
  middleware: [hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.READ)],
  handler: getElectrificationProjectDraftsController
});

openapiRoute(basePath, router, {
  method: 'post',
  path: '/draft',
  summary: 'Creates or updates an intake and set status to Draft',
  tags: TAGS,
  schema: schema.upsertDraft,
  responses: {
    200: { description: 'The updated electrification project draft', schema: draftSchema },
    201: { description: 'The created electrification project draft', schema: draftSchema },
    401: UNAUTHORIZED_RESPONSE,
    403: FORBIDDEN_RESPONSE,
    422: VALIDATION_ERROR_RESPONSE
  },
  middleware: [hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.CREATE)],
  handler: upsertElectrificationProjectDraftController
});

openapiRoute(basePath, router, {
  method: 'post',
  path: '/draft/submit',
  summary: 'Creates or updates an intake and set status to Submitted',
  tags: TAGS,
  schema: schema.submitElectrificationProjectDraft,
  responses: {
    201: { description: 'The submitted electrification project', schema: electrificationProjectSchema },
    401: UNAUTHORIZED_RESPONSE,
    403: FORBIDDEN_RESPONSE,
    422: VALIDATION_ERROR_RESPONSE
  },
  middleware: [hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.CREATE)],
  handler: submitElectrificationProjectDraftController
});

openapiRoute(basePath, router, {
  method: 'post',
  path: '/',
  summary: 'Creates a blank electrification project',
  tags: TAGS,
  schema: schema.createElectrificationProject,
  responses: {
    201: { description: 'The created electrification project', schema: electrificationProjectSchema },
    401: UNAUTHORIZED_RESPONSE,
    403: FORBIDDEN_RESPONSE,
    422: VALIDATION_ERROR_RESPONSE
  },
  middleware: [hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.CREATE)],
  handler: createElectrificationProjectController
});

openapiRoute(basePath, router, {
  method: 'delete',
  path: '/draft/:draftId',
  summary: 'Hard deletes a electrification project draft',
  tags: TAGS,
  schema: schema.deleteDraft,
  responses: {
    204: { description: 'The draft was deleted' },
    401: UNAUTHORIZED_RESPONSE,
    403: FORBIDDEN_RESPONSE,
    422: VALIDATION_ERROR_RESPONSE
  },
  middleware: [hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.DELETE), hasAccess('draftId')],
  handler: deleteElectrificationProjectDraftController
});

openapiRoute(basePath, router, {
  method: 'get',
  path: '/:electrificationProjectId',
  summary: 'Gets a specific electrification project',
  tags: TAGS,
  schema: schema.getElectrificationProject,
  responses: {
    200: { description: 'The requested electrification project', schema: electrificationProjectSchema },
    401: UNAUTHORIZED_RESPONSE,
    403: FORBIDDEN_RESPONSE,
    422: VALIDATION_ERROR_RESPONSE
  },
  middleware: [hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.READ), hasAccess('electrificationProjectId')],
  handler: getElectrificationProjectController
});

openapiRoute(basePath, router, {
  method: 'patch',
  path: '/:electrificationProjectId',
  summary: 'Patches a electrification project',
  tags: TAGS,
  schema: schema.patchElectrificationProject,
  responses: {
    200: { description: 'The updated electrification project', schema: electrificationProjectSchema },
    401: UNAUTHORIZED_RESPONSE,
    403: FORBIDDEN_RESPONSE,
    422: VALIDATION_ERROR_RESPONSE
  },
  middleware: [
    hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.UPDATE),
    hasAccess('electrificationProjectId')
  ],
  handler: patchElectrificationProjectController
});

openapiRoute(basePath, router, {
  method: 'delete',
  path: '/:electrificationProjectId',
  summary: 'Deletes an electrification project',
  tags: TAGS,
  schema: schema.deleteElectrificationProject,
  responses: {
    204: { description: 'The electrification project was deleted' },
    401: UNAUTHORIZED_RESPONSE,
    403: FORBIDDEN_RESPONSE,
    422: VALIDATION_ERROR_RESPONSE
  },
  middleware: [
    hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.DELETE),
    hasAccess('electrificationProjectId')
  ],
  handler: deleteElectrificationProjectController
});

export default router;
