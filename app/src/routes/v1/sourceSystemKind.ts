import express from 'express';
import { z } from 'zod';

import { openapiRoute } from './openapiRoute.ts';
import { listSourceSystemKindsController } from '#src/controllers/sourceSystemKind';
import { sourceSystemKindSchema } from '#src/validators/schemas/sourceSystemKindSchema';
import { UNAUTHORIZED_RESPONSE } from '#src/validators/schemas/problemResponseSchema';

const basePath = '/source-system-kind';
const router = express.Router();

openapiRoute(basePath, router, {
  method: 'get',
  path: '/',
  summary: 'Get all source system kind table data',
  tags: ['Source System Kind'],
  responses: {
    200: { description: 'A list of source system kinds', schema: z.array(sourceSystemKindSchema) },
    401: UNAUTHORIZED_RESPONSE
  },
  handler: listSourceSystemKindsController
});

export default router;
