import express from 'express';
import { z } from 'zod';

import { openapiRoute } from './openapiRoute.ts';
import { listPermitTypesController } from '#src/controllers/permitType';
import { hasAuthorization } from '#src/middleware/authorization';
import { requireSomeAuth } from '#src/middleware/requireSomeAuth';
import { requireSomeGroup } from '#src/middleware/requireSomeGroup';
import { Action, Resource } from '#src/utils/enums/application';
import { permitTypeSchema } from '#src/validators/schemas/permitTypeSchema';
import { problemResponse } from '#src/validators/schemas/problemResponse';
import { schema } from '#src/validators/permitType';

const basePath = '/permit-type';
const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

openapiRoute(basePath, router, {
  method: 'get',
  path: '/',
  summary: 'Get a list of permit types',
  tags: ['Permit Type'],
  schema: schema.listPermitTypes,
  responses: {
    200: { description: 'A list of permit types', schema: z.array(permitTypeSchema) },
    401: { description: 'Unauthorized', schema: problemResponse, contentType: 'application/problem+json' },
    403: { description: 'Forbidden', schema: problemResponse, contentType: 'application/problem+json' },
    422: { description: 'Validation error', schema: problemResponse, contentType: 'application/problem+json' }
  },
  middleware: [hasAuthorization(Resource.PERMIT_TYPE, Action.READ)],
  handler: listPermitTypesController
});

export default router;
