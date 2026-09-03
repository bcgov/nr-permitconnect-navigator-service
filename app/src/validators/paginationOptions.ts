import { z } from 'zod';

export const paginationOptions = z
  .object({
    skip: z.string().nullish(),
    sortField: z.string().nullish(),
    sortOrder: z.enum(['-1', '0', '1']).nullish(),
    take: z.string().nullish()
  })
  .strict();
