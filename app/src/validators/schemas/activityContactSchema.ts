import { z } from 'zod';

import { contactResponseSchema } from './activitySchema.ts';
import '#src/validators/openapi';
import { activity_contactModelSchema } from '#prismaZod';

export const activityContactBaseSchema = activity_contactModelSchema.omit({ activity: true, contact: true });

// contact is only included by listActivityContactsService, not create - see
// src/services/activityContact.ts.
export const activityContactSchema = activityContactBaseSchema
  .extend({ contact: contactResponseSchema.optional() })
  .openapi('ActivityContact');

// updateActivityContactService returns the updated row plus the row demoted from PRIMARY to
// ADMIN, if any - neither includes contact - see src/services/activityContact.ts.
export const updateActivityContactResponseSchema = z
  .object({
    updated: activityContactBaseSchema,
    demoted: activityContactBaseSchema.optional()
  })
  .openapi('UpdateActivityContactResponse');
