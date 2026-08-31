import { z } from 'zod';

import { activityId, dateOnlyString, notInFutureDate, queryBoolean, timeTzString, uuidv4 } from './common.ts';
import { paginationOptions } from './paginationOptions.ts';
import { sharedPermitNoteSchema } from './permitNote.ts';
import { permitTrackingSchema } from './permitTracking.ts';
import { permitTypeSchema } from './permitType.ts';
import { createStamps } from './stamps.ts';
import { requireValidCode } from '#src/db/codes/validator';
import { validate } from '#src/middleware/validation';

export const schema = {
  deletePermit: {
    params: z.object({
      permitId: uuidv4
    })
  },
  getPermit: {
    params: z.object({
      permitId: uuidv4
    })
  },
  intakePermit: {
    body: z
      .array(
        z.object({
          permitTypeId: z.number().max(255),
          activityId: activityId,
          trackingId: z.string().nullish(),
          submittedDate: notInFutureDate('"submittedDate" must be smaller than or equal to now').nullish()
        })
      )
      .min(1)
  },
  listPermits: {
    query: z.object({
      activityId: z.string().min(8).max(8).nullish(),
      includeNotes: queryBoolean.nullish()
    })
  },
  searchPermits: {
    query: z
      .object({
        dateRange: z.array(z.string()).length(2).nullish(),
        permitTypeId: z.string().nullish(),
        searchTag: z.string().nullish(),
        sourceSystemKindId: z.string().nullish()
      })
      .merge(paginationOptions)
  },
  upsertPermit: {
    body: z.object({
      permitType: permitTypeSchema.optional(),
      permitId: z.string().nullish(),
      permitTypeId: z.number().max(255),
      activityId: activityId.optional(),
      issuedPermitId: z.string().nullish(),
      permitNote: z.array(z.object(sharedPermitNoteSchema).nullable()).nullish(),
      permitTracking: permitTrackingSchema,
      needed: z.string().max(255),
      state: requireValidCode.PermitState(z.string().max(255)),
      stage: requireValidCode.PermitStage(z.string().max(255)),
      onHoldCode: requireValidCode.PiesOnHold(z.string().max(255)).nullish(),
      submittedDate: dateOnlyString.nullish(),
      submittedTime: timeTzString.nullish(),
      decisionDate: dateOnlyString.nullish(),
      decisionTime: timeTzString.nullish(),
      statusLastChanged: dateOnlyString.nullish(),
      statusLastChangedTime: timeTzString.nullish(),
      statusLastVerified: dateOnlyString.nullish(),
      statusLastVerifiedTime: timeTzString.nullish(),
      targetDate: z.coerce.date().nullish(),
      targetDateDescription: z.string().max(255).nullish(),
      technicalReviewer: z.string().max(255).nullish(),
      ...createStamps
    })
  }
};

export default {
  deletePermit: validate(schema.deletePermit),
  getPermit: validate(schema.getPermit),
  intakePermit: validate(schema.intakePermit),
  listPermits: validate(schema.listPermits),
  searchPermits: validate(schema.searchPermits),
  upsertPermit: validate(schema.upsertPermit)
};
