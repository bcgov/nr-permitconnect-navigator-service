import { z } from 'zod';

import { createStamps } from './stamps.ts';

export const permitTrackingSchema = z
  .array(
    z.object({
      trackingId: z.string().nullish(),
      permitTrackingId: z.number().nullish(),
      shownToProponent: z.boolean().nullish(),
      sourceSystemKindId: z.number().nullish(),
      sourceSystemKind: z
        .object({
          sourceSystemKindId: z.number(),
          description: z.string(),
          integrated: z.boolean().optional(),
          kind: z.string().nullish(),
          sourceSystem: z.string(),
          ...createStamps
        })
        .nullish(),
      permitId: z.string().nullish(),
      ...createStamps
    })
  )
  .nullish();
