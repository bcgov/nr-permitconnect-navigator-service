import express from 'express';

import { openapiRoute } from './openapiRoute.ts';
import {
  createActivityContactController,
  deleteActivityContactController,
  listActivityContactController,
  updateActivityContactController
} from '#src/controllers/activityContact';
import { hasAccess, hasAuthorization } from '#src/middleware/authorization';
import { requireActivityAdmin } from '#src/middleware/requireActivityAdmin';
import { requireSomeAuth } from '#src/middleware/requireSomeAuth';
import { requireSomeGroup } from '#src/middleware/requireSomeGroup';
import { Action, Resource } from '#src/utils/enums/application';
import { activityContactSchema, updateActivityContactResponseSchema } from '#src/schemas/response/activityContact';
import { FORBIDDEN_RESPONSE, UNAUTHORIZED_RESPONSE, VALIDATION_ERROR_RESPONSE } from '#src/schemas/response/problem';
import { schema } from '#src/schemas/request/activityContact';

import type { RequestHandler } from 'express';

// requireActivityAdmin's params type is narrower than openapiRoute's middleware array expects.
const requireActivityAdminHandler = requireActivityAdmin as RequestHandler;

const basePath = '/activity/{activityId}/contact';
const router = express.Router({ mergeParams: true }); // mergeParams allows parent router to pass route params down
router.use(requireSomeAuth);
router.use(requireSomeGroup);

openapiRoute(basePath, router, {
  method: 'get',
  path: '/',
  summary: 'List activity_contact linkages for an activity',
  tags: ['Contact'],
  schema: schema.listActivityContact,
  responses: {
    200: { description: 'A list of activity contact linkages', schema: activityContactSchema.array() },
    401: UNAUTHORIZED_RESPONSE,
    403: FORBIDDEN_RESPONSE,
    422: VALIDATION_ERROR_RESPONSE
  },
  middleware: [hasAuthorization(Resource.ACTIVITY_CONTACT, Action.READ), hasAccess('activityId')],
  handler: listActivityContactController
});

openapiRoute(basePath, router, {
  method: 'post',
  path: '/:contactId',
  summary: 'Create an activity_contact linkage for an activity',
  tags: ['Contact'],
  schema: schema.createActivityContact,
  responses: {
    201: { description: 'The created activity contact linkage', schema: activityContactSchema },
    401: UNAUTHORIZED_RESPONSE,
    403: FORBIDDEN_RESPONSE,
    422: VALIDATION_ERROR_RESPONSE
  },
  middleware: [hasAuthorization(Resource.ACTIVITY_CONTACT, Action.CREATE), requireActivityAdminHandler],
  handler: createActivityContactController
});

openapiRoute(basePath, router, {
  method: 'put',
  path: '/:contactId',
  summary: 'Update an activity_contact linkage for an activity',
  tags: ['Contact'],
  schema: schema.updateActivityContact,
  responses: {
    200: {
      description: 'The updated (and possibly demoted) activity contact linkages',
      schema: updateActivityContactResponseSchema
    },
    401: UNAUTHORIZED_RESPONSE,
    403: FORBIDDEN_RESPONSE,
    422: VALIDATION_ERROR_RESPONSE
  },
  middleware: [hasAuthorization(Resource.ACTIVITY_CONTACT, Action.UPDATE), requireActivityAdminHandler],
  handler: updateActivityContactController
});

openapiRoute(basePath, router, {
  method: 'delete',
  path: '/:contactId',
  summary: 'Delete an activity_contact linkage for an activity',
  tags: ['Contact'],
  schema: schema.deleteActivityContact,
  responses: {
    204: { description: 'The activity contact linkage was deleted' },
    401: UNAUTHORIZED_RESPONSE,
    403: FORBIDDEN_RESPONSE,
    422: VALIDATION_ERROR_RESPONSE
  },
  middleware: [hasAuthorization(Resource.ACTIVITY_CONTACT, Action.DELETE), requireActivityAdminHandler],
  handler: deleteActivityContactController
});

export default router;
