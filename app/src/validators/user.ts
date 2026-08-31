import { z } from 'zod';

import { uuidv4 } from './common.ts';
import { validate } from '#src/middleware/validation';

export const schema = {
  searchUsers: {
    body: z.object({
      userId: z.array(uuidv4).optional(),
      idp: z.array(z.string().max(255)).optional(),
      sub: z.string().max(255).optional(),
      email: z.string().max(255).optional(),
      firstName: z.string().max(255).optional(),
      fullName: z.string().max(255).optional(),
      lastName: z.string().max(255).optional(),
      active: z.boolean().optional(),
      group: z.array(z.string().max(255)).optional(),
      includeUserGroups: z.boolean().optional(),
      initiative: z.array(z.string().max(255)).optional()
    })
  }
};

export default {
  searchUsers: validate(schema.searchUsers)
};
