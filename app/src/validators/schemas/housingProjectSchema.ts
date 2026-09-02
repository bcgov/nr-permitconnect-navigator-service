import { z } from 'zod';

import { activityBaseSchema } from './activity.ts';
import '../openapi.ts';
import {
  activity_contactModelSchema,
  contactModelSchema,
  housing_projectModelSchema,
  userModelSchema
} from '#prismaZod';

// The generated pure model schemas stub every relation field as z.unknown() (they can't know which
// nested relations a given query actually includes). These narrow each one to exactly what the
// housing project services' `include` clauses populate, so the OpenAPI docs match what's actually
// returned. `activity`/`user` are `.optional()` below because several endpoints (create, submit)
// skip the include entirely and return the bare row - see src/services/housingProject.ts for the
// include shapes this mirrors.
const contactResponseSchema = contactModelSchema.omit({ activityContact: true, user: true });

// activity.activityContact as included by get/list/search/patch housing project (with .contact)
const activityContactWithContactSchema = activity_contactModelSchema
  .omit({ activity: true })
  .extend({ contact: contactResponseSchema });

const activityWithContactsSchema = activityBaseSchema.extend({
  activityContact: z.array(activityContactWithContactSchema)
});

const userResponseSchema = userModelSchema.omit({
  accessRequest: true,
  contact: true,
  electrificationProject: true,
  enquiry: true,
  generalProject: true,
  housingProject: true,
  identityProvider: true
});

export const housingProjectSchema = housing_projectModelSchema
  .extend({
    activity: activityWithContactsSchema.optional(),
    user: userResponseSchema.nullable().optional()
  })
  .openapi('HousingProject');
