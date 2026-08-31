import { z } from 'zod';

import { createStamps } from './stamps.ts';
import { validate } from '#src/middleware/validation';

export const schema = {
  getPeachSummary: {
    body: z.object({
      permitTrackings: z
        .array(
          z.object({
            trackingId: z.string().nullish(),
            permitTrackingId: z.number().nullish(),
            permitId: z.string().nullish(),
            shownToProponent: z.boolean().nullish(),
            sourceSystemKindId: z.number().nullish(),
            sourceSystemKind: z.object({
              sourceSystemKindId: z.number(),
              description: z.string(),
              integrated: z.boolean().optional(),
              kind: z.string().nullish(),
              sourceSystem: z.string(),
              ...createStamps
            }),
            ...createStamps
          })
        )
        .min(1)
    })
  }
};

export default {
  getPeachSummary: validate(schema.getPeachSummary)
};
