import express from 'express';
import { z } from 'zod';

import { openapiRoute } from './openapiRoute.ts';
import {
  deleteContactController,
  getContactController,
  getCurrentUserContactController,
  matchContactsController,
  searchContactsController,
  upsertContactController
} from '#src/controllers/contact';
import { hasAuthorization } from '#src/middleware/authorization';
import { hasIdentity } from '#src/middleware/identity';
import { requireSomeAuth } from '#src/middleware/requireSomeAuth';
import { requireSomeGroup } from '#src/middleware/requireSomeGroup';
import { Action, IdentityProviderKind, Resource } from '#src/utils/enums/application';
import { contactSchema } from '#src/schemas/response/contact';
import { FORBIDDEN_RESPONSE, UNAUTHORIZED_RESPONSE, VALIDATION_ERROR_RESPONSE } from '#src/schemas/response/problem';
import { schema } from '#src/schemas/request/contact';

const basePath = '/contact';
const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

openapiRoute(basePath, router, {
  method: 'get',
  path: '/',
  summary: "Get current user's contact information",
  tags: ['Contact'],
  responses: {
    200: { description: "The current user's contact", schema: contactSchema },
    401: UNAUTHORIZED_RESPONSE,
    403: FORBIDDEN_RESPONSE
  },
  middleware: [hasAuthorization(Resource.CONTACT, Action.READ)],
  handler: getCurrentUserContactController
});

openapiRoute(basePath, router, {
  method: 'post',
  path: '/match',
  summary: 'Match contacts',
  tags: ['Contact'],
  schema: schema.matchContacts,
  responses: {
    200: { description: 'Contacts matching the given search criteria', schema: z.array(contactSchema) },
    401: UNAUTHORIZED_RESPONSE,
    403: FORBIDDEN_RESPONSE,
    422: VALIDATION_ERROR_RESPONSE
  },
  middleware: [hasAuthorization(Resource.CONTACT, Action.READ)],
  handler: matchContactsController
});

openapiRoute(basePath, router, {
  method: 'post',
  path: '/search',
  summary: 'Search contacts',
  tags: ['Contact'],
  schema: schema.searchContacts,
  responses: {
    200: { description: 'Contacts matching the given search criteria', schema: z.array(contactSchema) },
    401: UNAUTHORIZED_RESPONSE,
    403: FORBIDDEN_RESPONSE,
    422: VALIDATION_ERROR_RESPONSE
  },
  middleware: [hasIdentity(IdentityProviderKind.AZUREIDIR), hasAuthorization(Resource.CONTACT, Action.READ)],
  handler: searchContactsController
});

openapiRoute(basePath, router, {
  method: 'get',
  path: '/:contactId',
  summary: 'Get a specific contact',
  tags: ['Contact'],
  schema: schema.getContact,
  responses: {
    200: { description: 'The requested contact', schema: contactSchema },
    401: UNAUTHORIZED_RESPONSE,
    403: FORBIDDEN_RESPONSE,
    422: VALIDATION_ERROR_RESPONSE
  },
  middleware: [hasAuthorization(Resource.CONTACT, Action.READ)],
  handler: getContactController
});

openapiRoute(basePath, router, {
  method: 'post',
  path: '/',
  summary: 'Create or update a contact',
  tags: ['Contact'],
  schema: schema.upsertContact,
  responses: {
    200: { description: 'The created or updated contact', schema: contactSchema },
    401: UNAUTHORIZED_RESPONSE,
    403: FORBIDDEN_RESPONSE,
    422: VALIDATION_ERROR_RESPONSE
  },
  middleware: [hasAuthorization(Resource.CONTACT, Action.UPDATE)],
  handler: upsertContactController
});

openapiRoute(basePath, router, {
  method: 'delete',
  path: '/:contactId',
  summary: 'Delete a specific contact',
  tags: ['Contact'],
  schema: schema.deleteContact,
  responses: {
    204: { description: 'The contact was deleted' },
    401: UNAUTHORIZED_RESPONSE,
    403: FORBIDDEN_RESPONSE,
    422: VALIDATION_ERROR_RESPONSE
  },
  middleware: [hasAuthorization(Resource.CONTACT, Action.DELETE)],
  handler: deleteContactController
});

export default router;
