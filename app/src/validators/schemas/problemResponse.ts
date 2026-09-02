import { z } from 'zod';

import '../openapi.ts';

// Shared RFC9457 problem+json shape used for every non-2xx response across all routes.
export const problemResponse = z
  .object({
    type: z.string(),
    title: z.string(),
    status: z.number(),
    detail: z.string().optional(),
    instance: z.string().optional()
  })
  .openapi('Problem');
