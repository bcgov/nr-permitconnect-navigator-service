import { z } from 'zod';

import { activityBaseSchema } from './activitySchema.ts';
import { activityContactBaseSchema } from './activityContactSchema.ts';
import { permitTypeSchema } from './permitTypeSchema.ts';
import { sourceSystemKindSchema } from './sourceSystemKindSchema.ts';
import '#src/validators/openapi';
import { permitModelSchema, permit_noteModelSchema, permit_trackingModelSchema } from '#prismaZod';

// activity.activityContact as included by listPermits (raw, no nested contact)
const activityWithContactsSchema = activityBaseSchema.extend({
  activityContact: z.array(activityContactBaseSchema)
});

const permitNoteSchema = permit_noteModelSchema.omit({ permit: true });

const permitTrackingSchema = permit_trackingModelSchema
  .omit({ permit: true, sourceSystemKind: true })
  .extend({ sourceSystemKind: sourceSystemKindSchema.nullable().optional() });

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
    permitTracking: z.array(permitTrackingSchema).optional()
  })
  .openapi('Permit');

// project fields are looked up by aliasing whichever of electrification/general/housingProject
// applies to the activity - streetAddress/locality/province only exist for general and housing.
// permit.search() (src/repositories/permit.ts) is a custom select, not the full Permit shape.
const searchPermitResultSchema = z.object({
  permitId: z.string(),
  activityId: z.string(),
  permitTypeId: z.number(),
  decisionDate: z.date().nullable(),
  stage: z.string(),
  state: z.string(),
  statusLastChanged: z.date().nullable(),
  submittedDate: z.date().nullable(),
  permitType: permitTypeSchema.pick({ businessDomain: true, name: true }).nullable(),
  project: z
    .object({
      projectId: z.string(),
      projectName: z.string().nullable(),
      companyNameRegistered: z.string().nullable(),
      streetAddress: z.string().nullable().optional(),
      locality: z.string().nullable().optional(),
      province: z.string().nullable().optional()
    })
    .optional()
});

export const searchPermitsResponseSchema = z
  .object({
    permits: z.array(searchPermitResultSchema),
    totalRecords: z.number()
  })
  .openapi('SearchPermitsResponse');
