import { z } from 'zod';

import { notInFutureDate } from './common.ts';
import { permitTrackingSchema } from './permitTracking.ts';
import { requireValidCode } from '#src/db/codes/validator';

export const appliedPermit = z
  .object({
    permitTypeId: z.number(),
    stage: requireValidCode.PermitStage(z.string()).nullish(),
    submittedDate: notInFutureDate('"submittedDate" must be smaller than or equal to now').nullish(),
    permitTracking: permitTrackingSchema
  })
  .strict();
