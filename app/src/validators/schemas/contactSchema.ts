import { z } from 'zod';

import { activityBaseSchema } from './activitySchema.ts';
import '#src/validators/openapi';
import { activity_contactModelSchema, contactModelSchema } from '#prismaZod';
import { userSchema } from '#src/validators/schemas/userSchema';

// activityContact.activity as included by getContact/searchContacts (no nested contact) - see
// src/services/contact.ts
const activityContactWithActivitySchema = activity_contactModelSchema
  .omit({ contact: true })
  .extend({ activity: activityBaseSchema });

// activityContact is only included when requested; user is only included by
// matchContactsExactService/searchContactsService - see src/services/contact.ts.
export const contactSchema = contactModelSchema
  .omit({ activityContact: true, user: true })
  .extend({
    activityContact: z.array(activityContactWithActivitySchema).optional(),
    user: userSchema.nullable().optional()
  })
  .openapi('Contact');
