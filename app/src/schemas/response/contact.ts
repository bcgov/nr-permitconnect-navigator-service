import { z } from 'zod';

import { activityBaseSchema } from './activity.ts';
import '#src/schemas/openapi';
import { activity_contactModelSchema, contactModelSchema } from '#prismaZod';
import { userSchema } from '#src/schemas/response/user';

// activityContact.activity as included by getContact/searchContacts (no nested contact) - see
// src/services/contact.ts. activity itself is optional: repositories/contact.ts's search() builds
// its include conditionally, so Prisma can't guarantee activity is always present here.
const activityContactWithActivitySchema = activity_contactModelSchema
  .omit({ contact: true })
  .extend({ activity: activityBaseSchema.optional() });

// activityContact is only included when requested; user is only included by
// matchContactsExactService/searchContactsService - see src/services/contact.ts.
export const contactSchema = contactModelSchema
  .omit({ activityContact: true, user: true })
  .extend({
    activityContact: z.array(activityContactWithActivitySchema).optional(),
    user: userSchema.nullable().optional()
  })
  .openapi('Contact');
