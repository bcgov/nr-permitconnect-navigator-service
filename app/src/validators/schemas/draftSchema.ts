import { z } from 'zod';

import { activityBaseSchema } from './activitySchema.ts';
import { activityContactBaseSchema } from './activityContactSchema.ts';
import '#src/validators/openapi';
import { draftModelSchema } from '#prismaZod';

// activity.activityContact as included by get/list draft (no nested .contact) - see
// src/services/draft.ts for the include shape this mirrors.
const activityForDraftSchema = activityBaseSchema.extend({
  activityContact: z.array(activityContactBaseSchema)
});

export const draftSchema = draftModelSchema
  // draft_code isn't generated (excluded as a non-API-facing model) and is never included anyway.
  .omit({ draftCodeDraftDraftCodeTodraftCode: true })
  .extend({ activity: activityForDraftSchema.optional() })
  .openapi('Draft');
