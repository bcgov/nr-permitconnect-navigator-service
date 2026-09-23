import { z } from 'zod';

import { activityBaseSchema } from './activity.ts';
import { activityContactBaseSchema } from './activityContact.ts';
import { permitTypeSchema } from './permitType.ts';
import { sourceSystemKindSchema } from './sourceSystemKind.ts';
import '#src/schemas/openapi';
import { permitModelSchema, permit_noteModelSchema, permit_trackingModelSchema } from '#prismaZod';

// activity.activityContact as included by listPermits (raw, no nested contact)
const activityWithContactsSchema = activityBaseSchema.extend({
  activityContact: z.array(activityContactBaseSchema)
});

const permitNoteSchema = permit_noteModelSchema.omit({ permit: true });

export const permitTrackingSchema = permit_trackingModelSchema
  .omit({ permit: true, sourceSystemKind: true })
  .extend({ sourceSystemKind: sourceSystemKindSchema.nullable().optional() })
  .openapi('PermitTracking');

// Which relations are present varies per endpoint - getPermit includes permitType/permitNote/
// permitTracking (no activity); listPermits also includes activity; intakePermit/searchPermits
// return no relations at all; upsertPermit includes only permitType - see src/services/permit.ts.
export const permitSchema = permitModelSchema
  .omit({
    activity: true,
    piesOnHoldCode: true,
    permitType: true,
    permitStageCode: true,
    permitStateCode: true,
    permitNote: true,
    permitTracking: true
  })
  .extend({
    activity: activityWithContactsSchema.optional(),
    permitType: permitTypeSchema.optional(),
    permitNote: z.array(permitNoteSchema).optional(),
    permitTracking: z.array(permitTrackingSchema).optional(),
    // permitStatusDatesTransform (a Prisma result extension, see
    // src/db/extensions/permitStatusDates.ts) serializes these 8 columns to date/time strings on
    // every read - the generated pure model types them as Date, which doesn't reflect that.
    submittedDate: z.string().nullable(),
    decisionDate: z.string().nullable(),
    statusLastVerified: z.string().nullable(),
    statusLastChanged: z.string().nullable(),
    submittedTime: z.string().nullable(),
    decisionTime: z.string().nullable(),
    statusLastVerifiedTime: z.string().nullable(),
    statusLastChangedTime: z.string().nullable()
  })
  .openapi('Permit');

// project fields are looked up by aliasing whichever of electrification/general/housingProject
// applies to the activity - streetAddress/locality/province only exist for general and housing.
// permit.search() (src/repositories/permit.ts) is a custom select, not the full Permit shape.
const searchPermitResultSchema = z.object({
  permitId: z.string(),
  activityId: z.string(),
  permitTypeId: z.number(),
  // permitStatusDatesTransform serializes these to strings on every read - see the comment on
  // permitSchema above.
  decisionDate: z.string().nullable(),
  stage: z.string(),
  state: z.string(),
  statusLastChanged: z.string().nullable(),
  submittedDate: z.string().nullable(),
  permitType: permitTypeSchema.pick({ businessDomain: true, name: true }),
  project: z
    .object({
      projectId: z.string(),
      projectName: z.string().nullable(),
      companyNameRegistered: z.string().nullable(),
      streetAddress: z.string().nullable().optional(),
      locality: z.string().nullable().optional(),
      province: z.string().nullable().optional()
    })
    .nullable()
});

export const searchPermitsResponseSchema = z
  .object({
    permits: z.array(searchPermitResultSchema),
    totalRecords: z.number()
  })
  .openapi('SearchPermitsResponse');
