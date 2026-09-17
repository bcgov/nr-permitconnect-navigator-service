import { activityWithContactsSchema } from './activitySchema.ts';
import '#src/validators/openapi';
import { electrification_projectModelSchema } from '#prismaZod';
import { userSchema } from '#src/validators/schemas/userSchema';

// Relation stubs narrowed to match src/services/electrificationProject.ts include - see housingProjectSchema.ts.
export const electrificationProjectSchema = electrification_projectModelSchema
  .extend({
    activity: activityWithContactsSchema.optional(),
    user: userSchema.nullable().optional()
  })
  .openapi('ElectrificationProject');
