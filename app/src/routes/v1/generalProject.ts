import express from 'express';
import { z } from 'zod';

import { openapiRoute } from './openapiRoute.ts';
import {
  createGeneralProjectController,
  deleteGeneralProjectController,
  deleteGeneralProjectDraftController,
  getGeneralProjectController,
  getGeneralProjectDraftController,
  getGeneralProjectDraftsController,
  getGeneralProjectStatisticsController,
  listGeneralProjectActivityIdsController,
  listGeneralProjectsController,
  patchGeneralProjectController,
  searchGeneralProjectsController,
  submitGeneralProjectDraftController,
  upsertGeneralProjectDraftController
} from '#src/controllers/generalProject';
import { hasAccess, hasAuthorization } from '#src/middleware/authorization';
import { requireSomeAuth } from '#src/middleware/requireSomeAuth';
import { requireSomeGroup } from '#src/middleware/requireSomeGroup';
import { Action, Resource } from '#src/utils/enums/application';
import { draftSchema } from '#src/schemas/response/draft';
import { generalProjectSchema } from '#src/schemas/response/generalProject';
import { generalProjectStatisticsSchema } from '#src/schemas/response/projectStatistics';
import { FORBIDDEN_RESPONSE, UNAUTHORIZED_RESPONSE, VALIDATION_ERROR_RESPONSE } from '#src/schemas/response/problem';
import { schema } from '#src/schemas/request/generalProject';

const basePath = '/general/project';
const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

const TAGS = ['General Project'];

openapiRoute(basePath, router, {
  method: 'get',
  path: '/',
  summary: 'Gets a list of general projects',
  tags: TAGS,
  responses: {
    200: { description: 'A list of general projects', schema: z.array(generalProjectSchema) },
    401: UNAUTHORIZED_RESPONSE,
    403: FORBIDDEN_RESPONSE
  },
  middleware: [hasAuthorization(Resource.GENERAL_PROJECT, Action.READ)],
  handler: listGeneralProjectsController
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
  middleware: [hasAuthorization(Resource.GENERAL_PROJECT, Action.READ)],
  handler: listGeneralProjectActivityIdsController
});

openapiRoute(basePath, router, {
  method: 'post',
  path: '/search',
  summary: 'Search general projects',
  tags: TAGS,
  schema: schema.searchGeneralProjects,
  responses: {
    200: {
      description: 'A list of general projects matching the search criteria',
      schema: z.array(generalProjectSchema)
    },
    401: UNAUTHORIZED_RESPONSE,
    403: FORBIDDEN_RESPONSE,
    422: VALIDATION_ERROR_RESPONSE
  },
  middleware: [hasAuthorization(Resource.GENERAL_PROJECT, Action.READ)],
  handler: searchGeneralProjectsController
});

openapiRoute(basePath, router, {
  method: 'get',
  path: '/statistics',
  summary: 'Gets general project statistics',
  tags: TAGS,
  schema: schema.getStatistics,
  responses: {
    200: { description: 'General project statistics', schema: generalProjectStatisticsSchema },
    401: UNAUTHORIZED_RESPONSE,
    403: FORBIDDEN_RESPONSE,
    422: VALIDATION_ERROR_RESPONSE
  },
  middleware: [hasAuthorization(Resource.GENERAL_PROJECT, Action.READ)],
  handler: getGeneralProjectStatisticsController
});

openapiRoute(basePath, router, {
  method: 'get',
  path: '/draft/:draftId',
  summary: 'Get a specific general project draft',
  tags: TAGS,
  schema: schema.getDraft,
  responses: {
    200: { description: 'The requested draft', schema: draftSchema },
    401: UNAUTHORIZED_RESPONSE,
    403: FORBIDDEN_RESPONSE,
    422: VALIDATION_ERROR_RESPONSE
  },
  middleware: [hasAuthorization(Resource.GENERAL_PROJECT, Action.READ), hasAccess('draftId')],
  handler: getGeneralProjectDraftController
});

openapiRoute(basePath, router, {
  method: 'get',
  path: '/draft',
  summary: 'Gets a list of general project drafts',
  tags: TAGS,
  responses: {
    200: { description: 'A list of general project drafts', schema: z.array(draftSchema) },
    401: UNAUTHORIZED_RESPONSE,
    403: FORBIDDEN_RESPONSE
  },
  middleware: [hasAuthorization(Resource.GENERAL_PROJECT, Action.READ)],
  handler: getGeneralProjectDraftsController
});

openapiRoute(basePath, router, {
  method: 'post',
  path: '/draft',
  summary: 'Creates or updates an intake and set status to Draft',
  tags: TAGS,
  schema: schema.upsertDraft,
  responses: {
    200: { description: 'The updated general project draft', schema: draftSchema },
    201: { description: 'The created general project draft', schema: draftSchema },
    401: UNAUTHORIZED_RESPONSE,
    403: FORBIDDEN_RESPONSE,
    422: VALIDATION_ERROR_RESPONSE
  },
  middleware: [hasAuthorization(Resource.GENERAL_PROJECT, Action.CREATE)],
  handler: upsertGeneralProjectDraftController
});

openapiRoute(basePath, router, {
  method: 'post',
  path: '/draft/submit',
  summary: 'Creates or updates an intake and set status to Submitted',
  tags: TAGS,
  schema: schema.submitGeneralProjectDraft,
  responses: {
    201: { description: 'The submitted general project', schema: generalProjectSchema },
    401: UNAUTHORIZED_RESPONSE,
    403: FORBIDDEN_RESPONSE,
    422: VALIDATION_ERROR_RESPONSE
  },
  middleware: [hasAuthorization(Resource.GENERAL_PROJECT, Action.CREATE)],
  handler: submitGeneralProjectDraftController
});

openapiRoute(basePath, router, {
  method: 'post',
  path: '/',
  summary: 'Creates a blank general project',
  tags: TAGS,
  schema: schema.createGeneralProject,
  responses: {
    201: { description: 'The created general project', schema: generalProjectSchema },
    401: UNAUTHORIZED_RESPONSE,
    403: FORBIDDEN_RESPONSE,
    422: VALIDATION_ERROR_RESPONSE
  },
  middleware: [hasAuthorization(Resource.GENERAL_PROJECT, Action.CREATE)],
  handler: createGeneralProjectController
});

openapiRoute(basePath, router, {
  method: 'delete',
  path: '/draft/:draftId',
  summary: 'Hard deletes a general project draft',
  tags: TAGS,
  schema: schema.deleteDraft,
  responses: {
    204: { description: 'The draft was deleted' },
    401: UNAUTHORIZED_RESPONSE,
    403: FORBIDDEN_RESPONSE,
    422: VALIDATION_ERROR_RESPONSE
  },
  middleware: [hasAuthorization(Resource.GENERAL_PROJECT, Action.DELETE), hasAccess('draftId')],
  handler: deleteGeneralProjectDraftController
});

openapiRoute(basePath, router, {
  method: 'get',
  path: '/:generalProjectId',
  summary: 'Gets a specific general project',
  tags: TAGS,
  schema: schema.getGeneralProject,
  responses: {
    200: { description: 'The requested general project', schema: generalProjectSchema },
    401: UNAUTHORIZED_RESPONSE,
    403: FORBIDDEN_RESPONSE,
    422: VALIDATION_ERROR_RESPONSE
  },
  middleware: [hasAuthorization(Resource.GENERAL_PROJECT, Action.READ), hasAccess('generalProjectId')],
  handler: getGeneralProjectController
});

openapiRoute(basePath, router, {
  method: 'patch',
  path: '/:generalProjectId',
  summary: 'Patches a general project',
  tags: TAGS,
  schema: schema.patchGeneralProject,
  responses: {
    200: { description: 'The updated general project', schema: generalProjectSchema },
    401: UNAUTHORIZED_RESPONSE,
    403: FORBIDDEN_RESPONSE,
    422: VALIDATION_ERROR_RESPONSE
  },
  middleware: [hasAuthorization(Resource.GENERAL_PROJECT, Action.UPDATE), hasAccess('generalProjectId')],
  handler: patchGeneralProjectController
});

openapiRoute(basePath, router, {
  method: 'delete',
  path: '/:generalProjectId',
  summary: 'Deletes a general project',
  tags: TAGS,
  schema: schema.deleteGeneralProject,
  responses: {
    204: { description: 'The general project was deleted' },
    401: UNAUTHORIZED_RESPONSE,
    403: FORBIDDEN_RESPONSE,
    422: VALIDATION_ERROR_RESPONSE
  },
  middleware: [hasAuthorization(Resource.GENERAL_PROJECT, Action.DELETE), hasAccess('generalProjectId')],
  handler: deleteGeneralProjectController
});

export default router;
