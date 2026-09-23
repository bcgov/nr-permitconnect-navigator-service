import { z } from 'zod';

import '#src/schemas/openapi';

// Shared RFC9457 problem+json shape used for every non-2xx response across all routes
export const problemSchema = z
  .object({
    type: z.string(),
    title: z.string(),
    status: z.number(),
    detail: z.string().optional(),
    instance: z.string().optional()
  })
  .openapi('Problem');

export const UNAUTHORIZED_RESPONSE = {
  description: 'Unauthorized',
  schema: problemSchema,
  contentType: 'application/problem+json'
};
export const FORBIDDEN_RESPONSE = {
  description: 'Forbidden',
  schema: problemSchema,
  contentType: 'application/problem+json'
};
export const VALIDATION_ERROR_RESPONSE = {
  description: 'Validation error',
  schema: problemSchema,
  contentType: 'application/problem+json'
};
