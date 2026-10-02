import { z } from 'zod';

export const paginationOptions = z
  .object({
    skip: z.coerce.number().int().min(0).default(0),
    sortField: z.string().nullish(),
    sortOrder: z.enum(['-1', '0', '1']).nullish(),
    take: z.coerce.number().int().min(1).max(100).default(10)
  })
  .strict();
