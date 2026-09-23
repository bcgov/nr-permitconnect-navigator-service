import { z } from 'zod';

import { activityWithContactsSchema } from './activity.ts';
import '#src/schemas/openapi';
import { electrification_projectModelSchema } from '#prismaZod';
import { userSchema } from '#src/schemas/response/user';

// Relation stubs narrowed to match src/services/electrificationProject.ts include - see housingProjectSchema.ts.
// projectId aliases electrificationProjectId on every read - see src/db/extensions/projectId.ts.
// electrificationProjectCategoryCode/TypeCode relation stubs are never included by any query - see
// src/services/electrificationProject.ts. megawatts is a Decimal column that numeric.ts (a Prisma
// result extension, see src/db/extensions/numeric.ts) converts to a string on every read.
export const electrificationProjectSchema = electrification_projectModelSchema
  .omit({ electrificationProjectCategoryCode: true, electrificationProjectTypeCode: true, megawatts: true })
  .extend({
    activity: activityWithContactsSchema.optional(),
    user: userSchema.nullable().optional(),
    projectId: z.string(),
    megawatts: z.string().nullable()
  })
  .openapi('ElectrificationProject');
