import { z } from 'zod';

import { activityWithContactsSchema } from './activity.ts';
import '#src/schemas/openapi';
import { general_projectModelSchema } from '#prismaZod';
import { userSchema } from '#src/schemas/response/user';

// Relation stubs narrowed to match src/services/generalProject.ts include - see housingProjectSchema.ts.
// projectId aliases generalProjectId on every read - see src/db/extensions/projectId.ts.
// businessAreaCode relation stub is never included by any query - see src/services/generalProject.ts.
// latitude/longitude are Decimal columns that numeric.ts (a Prisma result extension, see
// src/db/extensions/numeric.ts) converts to strings on every read.
export const generalProjectSchema = general_projectModelSchema
  .omit({ businessAreaCode: true, latitude: true, longitude: true })
  .extend({
    activity: activityWithContactsSchema.optional(),
    user: userSchema.nullable().optional(),
    projectId: z.string(),
    latitude: z.string().nullable(),
    longitude: z.string().nullable()
  })
  .openapi('GeneralProject');
