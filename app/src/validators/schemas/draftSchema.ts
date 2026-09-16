import { z } from 'zod';

import { activityBaseSchema } from './activity.ts';
import '#src/validators/openapi';
import { activity_contactModelSchema, draftModelSchema } from '#prismaZod';

// activity.activityContact as included by get/list draft (no nested .contact) - see
// src/services/draft.ts for the include shape this mirrors.
const activityContactNoContactSchema = activity_contactModelSchema.omit({ activity: true, contact: true });

const activityForDraftSchema = activityBaseSchema.extend({
  activityContact: z.array(activityContactNoContactSchema)
});

export const draftSchema = draftModelSchema
  // draft_code isn't generated (excluded as a non-API-facing model) and is never included anyway
  .omit({ draftCodeDraftDraftCodeTodraftCode: true })
  .extend({ activity: activityForDraftSchema.optional() })
  .openapi('Draft');
