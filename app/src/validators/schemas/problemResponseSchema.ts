import { z } from 'zod';

import '#src/validators/openapi';

// Shared RFC9457 problem+json shape used for every non-2xx response across all routes
export const problemResponse = z
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
  schema: problemResponse,
  contentType: 'application/problem+json'
};
export const FORBIDDEN_RESPONSE = {
  description: 'Forbidden',
  schema: problemResponse,
  contentType: 'application/problem+json'
};
export const VALIDATION_ERROR_RESPONSE = {
  description: 'Validation error',
  schema: problemResponse,
  contentType: 'application/problem+json'
};
