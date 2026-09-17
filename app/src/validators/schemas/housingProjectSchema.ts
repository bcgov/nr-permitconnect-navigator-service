import { activityWithContactsSchema } from './activitySchema.ts';
import '#src/validators/openapi';
import { housing_projectModelSchema } from '#prismaZod';
import { userSchema } from '#src/validators/schemas/userSchema';

// The generated pure model schema stubs every relation field as z.unknown() (it can't know which
// nested relations a given query actually includes). `activity`/`user` are narrowed to exactly
// what the housing project services' `include` clauses populate, and made `.optional()` because
// several endpoints (create, submit) skip the include entirely and return the bare row - see
// src/services/housingProject.ts for the include shapes this mirrors.
export const housingProjectSchema = housing_projectModelSchema
  .extend({
    activity: activityWithContactsSchema.optional(),
    user: userSchema.nullable().optional()
  })
  .openapi('HousingProject');
