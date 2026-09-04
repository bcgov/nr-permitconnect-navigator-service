import { z } from 'zod';

import { uuidv4 } from './common.ts';
import { validate } from '#src/middleware/validation';

export const schema = {
  createUserAccessRequest: {
    body: z
      .object({
        user: z
          .object({
            userId: uuidv4.nullish(),
            idp: z.string().min(1).max(255),
            sub: z.string().min(1).max(255),
            email: z.string().min(1).max(255),
            firstName: z.string().min(1).max(255),
            fullName: z.string().min(1).max(255),
            lastName: z.string().min(1).max(255),
            bceidBusinessName: z.string().max(255).nullish(),
            active: z.boolean().optional()
          })
          .strict(),
        accessRequest: z
          .object({
            accessRequestId: uuidv4.nullish(),
            userId: uuidv4.nullish(),
            grant: z.boolean(),
            groupId: z.number().nullish(),
            status: z.string().max(255).nullish(),
            update: z.boolean().nullish()
          })
          .strict()
          .superRefine((data, ctx) => {
            if (data.grant && (data.groupId === undefined || data.groupId === null)) {
              ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['groupId'], message: '"groupId" is required' });
            }
          })
      })
      .strict()
  },

  processUserAccessRequest: {
    params: z
      .object({
        accessRequestId: uuidv4
      })
      .strict(),
    body: z
      .object({
        approve: z.boolean()
      })
      .strict()
  }
};

export default {
  createUserAccessRequest: validate(schema.createUserAccessRequest),
  processUserAccessRequest: validate(schema.processUserAccessRequest)
};
