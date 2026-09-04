import { z } from 'zod';

import { activityId, email, uuidv4 } from './common.ts';
import { validate } from '#src/middleware/validation';

export const schema = {
  getRoadmapNote: {
    query: z
      .object({
        activityId: activityId
      })
      .strict()
  },
  send: {
    body: z
      .object({
        activityId: activityId,
        selectedFileIds: z.array(uuidv4).optional(),
        emailData: z
          .object({
            bcc: z.array(email).optional(),
            bodyType: z.string().min(1),
            body: z.string().min(1),
            cc: z.array(email).optional(),
            delayTS: z.number().optional(),
            from: email,
            priority: z.string().optional(),
            subject: z.string().min(1),
            tag: z.string().optional(),
            to: z.array(email)
          })
          .strict()
      })
      .strict()
  }
};

export default {
  getRoadmapNote: validate(schema.getRoadmapNote),
  send: validate(schema.send)
};
