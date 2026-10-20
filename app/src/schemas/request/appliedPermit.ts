import { z } from 'zod';

import { notInFutureDate } from './common.ts';
import { permitTrackingSchema } from './permitTracking.ts';
import { YES_NO_UNSURE_LIST } from '#src/utils/constants/application';
import { BasicResponse } from '#src/utils/enums/application';

export const appliedPermit = z
  .object({
    permitTypeId: z.number(),
    submittedDate: notInFutureDate('"submittedDate" must be smaller than or equal to now').nullish(),
    permitTracking: permitTrackingSchema
  })
  .strict();

export const intakePermits = z
  .object({
    appliedPermits: z.array(appliedPermit).nullish(),
    hasAppliedProvincialPermits: z.enum(YES_NO_UNSURE_LIST as [string, ...string[]]),
    investigatePermits: z.array(z.object({ permitTypeId: z.number() }).strict()).nullish()
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.hasAppliedProvincialPermits === BasicResponse.NO && data.appliedPermits?.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['appliedPermits'],
        message: '"appliedPermits" must be empty when "hasAppliedProvincialPermits" is "No"'
      });
    }
  });
