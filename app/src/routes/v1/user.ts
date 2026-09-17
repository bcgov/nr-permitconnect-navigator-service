import express from 'express';
import { z } from 'zod';

import { openapiRoute } from './openapiRoute.ts';
import { searchUsersController } from '#src/controllers/user';
import { hasAuthorization } from '#src/middleware/authorization';
import { hasIdentity } from '#src/middleware/identity';
import { requireSomeAuth } from '#src/middleware/requireSomeAuth';
import { requireSomeGroup } from '#src/middleware/requireSomeGroup';
import { Action, IdentityProviderKind, Resource } from '#src/utils/enums/application';
import { userSchema } from '#src/validators/schemas/userSchema';
import {
  FORBIDDEN_RESPONSE,
  UNAUTHORIZED_RESPONSE,
  VALIDATION_ERROR_RESPONSE
} from '#src/validators/schemas/problemResponseSchema';
import { schema } from '#src/validators/user';

const basePath = '/user';
const router = express.Router();
router.use(requireSomeAuth);
router.use(hasIdentity(IdentityProviderKind.AZUREIDIR));
router.use(requireSomeGroup);

openapiRoute(basePath, router, {
  method: 'post',
  path: '/search',
  summary: 'Search users',
  tags: ['User'],
  schema: schema.searchUsers,
  responses: {
    200: { description: 'A list of users matching the search criteria', schema: z.array(userSchema) },
    401: UNAUTHORIZED_RESPONSE,
    403: FORBIDDEN_RESPONSE,
    422: VALIDATION_ERROR_RESPONSE
  },
  middleware: [hasAuthorization(Resource.USER, Action.READ)],
  handler: searchUsersController
});

export default router;
