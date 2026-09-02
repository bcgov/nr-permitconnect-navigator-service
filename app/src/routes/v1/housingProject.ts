import express from 'express';
import { z } from 'zod';

import { openapiRoute } from './openapiRoute.ts';
import {
  createHousingProjectController,
  deleteHousingProjectController,
  deleteHousingProjectDraftController,
  getHousingProjectController,
  getHousingProjectDraftController,
  getHousingProjectDraftsController,
  getHousingProjectStatisticsController,
  listHousingProjectActivityIdsController,
  listHousingProjectsController,
  patchHousingProjectController,
  searchHousingProjectsController,
  submitHousingProjectDraftController,
  upsertHousingProjectDraftController
} from '#src/controllers/housingProject';
import { hasAccess, hasAuthorization } from '#src/middleware/authorization';
import { hasIdentity } from '#src/middleware/identity';
import { requireSomeAuth } from '#src/middleware/requireSomeAuth';
import { requireSomeGroup } from '#src/middleware/requireSomeGroup';
import { Action, IdentityProviderKind, Resource } from '#src/utils/enums/application';
import { draftSchema } from '#src/validators/schemas/draftSchema';
import { housingProjectSchema } from '#src/validators/schemas/housingProjectSchema';
import { housingProjectStatisticsSchema } from '#src/validators/schemas/housingProjectStatisticsSchema';
import { problemResponse } from '#src/validators/schemas/problemResponse';
import { schema } from '#src/validators/housingProject';

const TAGS = ['Housing Project'];
const basePath = '/housing/project';
const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

openapiRoute(basePath, router, {
  method: 'get',
  path: '/',
  summary: 'Gets a list of housing projects',
  tags: TAGS,
  responses: {
    200: { description: 'A list of housing projects', schema: z.array(housingProjectSchema) },
    401: { description: 'Unauthorized', schema: problemResponse, contentType: 'application/problem+json' },
    403: { description: 'Forbidden', schema: problemResponse, contentType: 'application/problem+json' }
  },
  middleware: [hasAuthorization(Resource.HOUSING_PROJECT, Action.READ)],
  handler: listHousingProjectsController
});

openapiRoute(basePath, router, {
  method: 'get',
  path: '/activityIds',
  summary: 'Get a list of all the activityIds',
  tags: TAGS,
  responses: {
    200: { description: 'A list of activity IDs', schema: z.array(z.string()) },
    401: { description: 'Unauthorized', schema: problemResponse, contentType: 'application/problem+json' },
    403: { description: 'Forbidden', schema: problemResponse, contentType: 'application/problem+json' }
  },
  middleware: [hasAuthorization(Resource.HOUSING_PROJECT, Action.READ)],
  handler: listHousingProjectActivityIdsController
});

openapiRoute(basePath, router, {
  method: 'post',
  path: '/search',
  summary: 'Search housing projects',
  tags: TAGS,
  schema: schema.searchHousingProjects,
  responses: {
    200: { description: 'Housing projects matching the search criteria', schema: z.array(housingProjectSchema) },
    401: { description: 'Unauthorized', schema: problemResponse, contentType: 'application/problem+json' },
    403: { description: 'Forbidden', schema: problemResponse, contentType: 'application/problem+json' },
    422: { description: 'Validation error', schema: problemResponse, contentType: 'application/problem+json' }
  },
  middleware: [hasAuthorization(Resource.HOUSING_PROJECT, Action.READ)],
  handler: searchHousingProjectsController
});

openapiRoute(basePath, router, {
  method: 'get',
  path: '/statistics',
  summary: 'Gets housing project statistics',
  tags: TAGS,
  schema: schema.getStatistics,
  responses: {
    200: { description: 'Housing project statistics', schema: housingProjectStatisticsSchema },
    401: { description: 'Unauthorized', schema: problemResponse, contentType: 'application/problem+json' },
    403: { description: 'Forbidden', schema: problemResponse, contentType: 'application/problem+json' },
    422: { description: 'Validation error', schema: problemResponse, contentType: 'application/problem+json' }
  },
  middleware: [hasAuthorization(Resource.HOUSING_PROJECT, Action.READ)],
  handler: getHousingProjectStatisticsController
});

openapiRoute(basePath, router, {
  method: 'get',
  path: '/draft/:draftId',
  summary: 'Get a specific housing project draft',
  tags: TAGS,
  schema: schema.getDraft,
  responses: {
    200: { description: 'A housing project draft', schema: draftSchema },
    401: { description: 'Unauthorized', schema: problemResponse, contentType: 'application/problem+json' },
    403: { description: 'Forbidden', schema: problemResponse, contentType: 'application/problem+json' },
    422: { description: 'Validation error', schema: problemResponse, contentType: 'application/problem+json' }
  },
  middleware: [hasAuthorization(Resource.HOUSING_PROJECT, Action.READ), hasAccess('draftId')],
  handler: getHousingProjectDraftController
});

openapiRoute(basePath, router, {
  method: 'get',
  path: '/draft',
  summary: 'Gets a list of housing project drafts',
  tags: TAGS,
  responses: {
    200: { description: 'A list of housing project drafts', schema: z.array(draftSchema) },
    401: { description: 'Unauthorized', schema: problemResponse, contentType: 'application/problem+json' },
    403: { description: 'Forbidden', schema: problemResponse, contentType: 'application/problem+json' }
  },
  middleware: [hasAuthorization(Resource.HOUSING_PROJECT, Action.READ)],
  handler: getHousingProjectDraftsController
});

openapiRoute(basePath, router, {
  method: 'post',
  path: '/draft',
  summary: 'Creates or updates an intake and set status to Draft',
  tags: TAGS,
  schema: schema.upsertDraft,
  responses: {
    200: { description: 'The updated housing project draft', schema: draftSchema },
    201: { description: 'The created housing project draft', schema: draftSchema },
    401: { description: 'Unauthorized', schema: problemResponse, contentType: 'application/problem+json' },
    403: { description: 'Forbidden', schema: problemResponse, contentType: 'application/problem+json' },
    422: { description: 'Validation error', schema: problemResponse, contentType: 'application/problem+json' }
  },
  middleware: [hasAuthorization(Resource.HOUSING_PROJECT, Action.CREATE)],
  handler: upsertHousingProjectDraftController
});

openapiRoute(basePath, router, {
  method: 'post',
  path: '/draft/submit',
  summary: 'Creates or updates an intake and set status to Submitted',
  tags: TAGS,
  schema: schema.createHousingProject,
  responses: {
    201: { description: 'The submitted housing project', schema: housingProjectSchema },
    401: { description: 'Unauthorized', schema: problemResponse, contentType: 'application/problem+json' },
    403: { description: 'Forbidden', schema: problemResponse, contentType: 'application/problem+json' },
    422: { description: 'Validation error', schema: problemResponse, contentType: 'application/problem+json' }
  },
  middleware: [hasAuthorization(Resource.HOUSING_PROJECT, Action.CREATE)],
  handler: submitHousingProjectDraftController
});

openapiRoute(basePath, router, {
  method: 'post',
  path: '/',
  summary: 'Creates a blank housing project',
  tags: TAGS,
  schema: schema.createHousingProject,
  responses: {
    201: { description: 'The created housing project', schema: housingProjectSchema },
    401: { description: 'Unauthorized', schema: problemResponse, contentType: 'application/problem+json' },
    403: { description: 'Forbidden', schema: problemResponse, contentType: 'application/problem+json' },
    422: { description: 'Validation error', schema: problemResponse, contentType: 'application/problem+json' }
  },
  middleware: [hasIdentity(IdentityProviderKind.AZUREIDIR), hasAuthorization(Resource.HOUSING_PROJECT, Action.CREATE)],
  handler: createHousingProjectController
});

openapiRoute(basePath, router, {
  method: 'delete',
  path: '/draft/:draftId',
  summary: 'Hard deletes a housing project draft',
  tags: TAGS,
  schema: schema.deleteDraft,
  responses: {
    204: { description: 'The draft was deleted' },
    401: { description: 'Unauthorized', schema: problemResponse, contentType: 'application/problem+json' },
    403: { description: 'Forbidden', schema: problemResponse, contentType: 'application/problem+json' },
    422: { description: 'Validation error', schema: problemResponse, contentType: 'application/problem+json' }
  },
  middleware: [hasAuthorization(Resource.HOUSING_PROJECT, Action.DELETE), hasAccess('draftId')],
  handler: deleteHousingProjectDraftController
});

openapiRoute(basePath, router, {
  method: 'get',
  path: '/:housingProjectId',
  summary: 'Gets a specific housing project',
  tags: TAGS,
  schema: schema.getHousingProject,
  responses: {
    200: { description: 'A housing project', schema: housingProjectSchema },
    401: { description: 'Unauthorized', schema: problemResponse, contentType: 'application/problem+json' },
    403: { description: 'Forbidden', schema: problemResponse, contentType: 'application/problem+json' },
    422: { description: 'Validation error', schema: problemResponse, contentType: 'application/problem+json' }
  },
  middleware: [hasAuthorization(Resource.HOUSING_PROJECT, Action.READ), hasAccess('housingProjectId')],
  handler: getHousingProjectController
});

openapiRoute(basePath, router, {
  method: 'patch',
  path: '/:housingProjectId',
  summary: 'Patches a housing project',
  tags: TAGS,
  schema: schema.patchHousingProject,
  responses: {
    200: { description: 'The patched housing project', schema: housingProjectSchema },
    401: { description: 'Unauthorized', schema: problemResponse, contentType: 'application/problem+json' },
    403: { description: 'Forbidden', schema: problemResponse, contentType: 'application/problem+json' },
    422: { description: 'Validation error', schema: problemResponse, contentType: 'application/problem+json' }
  },
  middleware: [hasAuthorization(Resource.HOUSING_PROJECT, Action.UPDATE), hasAccess('housingProjectId')],
  handler: patchHousingProjectController
});

openapiRoute(basePath, router, {
  method: 'delete',
  path: '/:housingProjectId',
  summary: 'Deletes a housing project',
  tags: TAGS,
  schema: schema.deleteHousingProject,
  responses: {
    204: { description: 'The housing project was deleted' },
    401: { description: 'Unauthorized', schema: problemResponse, contentType: 'application/problem+json' },
    403: { description: 'Forbidden', schema: problemResponse, contentType: 'application/problem+json' },
    422: { description: 'Validation error', schema: problemResponse, contentType: 'application/problem+json' }
  },
  middleware: [hasAuthorization(Resource.HOUSING_PROJECT, Action.DELETE), hasAccess('housingProjectId')],
  handler: deleteHousingProjectController
});

export default router;
