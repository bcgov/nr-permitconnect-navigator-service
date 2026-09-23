import { z } from 'zod';

import { activityWithContactsSchema } from './activity.ts';
import '#src/schemas/openapi';
import { housing_projectModelSchema } from '#prismaZod';
import { userSchema } from '#src/schemas/response/user';

// The generated pure model schema stubs every relation field as z.unknown() (it can't know which
// nested relations a given query actually includes). `activity`/`user` are narrowed to exactly
// what the housing project services' `include` clauses populate, and made `.optional()` because
// several endpoints (create, submit) skip the include entirely and return the bare row - see
// src/services/housingProject.ts for the include shapes this mirrors. projectId aliases
// housingProjectId on every read - see src/db/extensions/projectId.ts. latitude/longitude are
// Decimal columns that numeric.ts (a Prisma result extension, see src/db/extensions/numeric.ts)
// converts to strings on every read.
export const housingProjectSchema = housing_projectModelSchema
  .omit({ latitude: true, longitude: true })
  .extend({
    activity: activityWithContactsSchema.optional(),
    user: userSchema.nullable().optional(),
    projectId: z.string(),
    latitude: z.string().nullable(),
    longitude: z.string().nullable()
  })
  .openapi('HousingProject');
