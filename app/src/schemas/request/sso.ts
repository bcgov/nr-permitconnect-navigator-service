import { z } from 'zod';

export const schema = {
  searchIdirUsers: {
    query: z
      .object({
        firstName: z.string().max(255).optional(),
        lastName: z.string().max(255).optional(),
        email: z.string().max(255).optional()
      })
      .strict()
  }
};
