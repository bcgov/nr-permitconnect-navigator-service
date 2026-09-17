import { activityWithContactsSchema } from './activitySchema.ts';
import '#src/validators/openapi';
import { general_projectModelSchema } from '#prismaZod';
import { userSchema } from '#src/validators/schemas/userSchema';

// Relation stubs narrowed to match src/services/generalProject.ts include - see housingProjectSchema.ts.
export const generalProjectSchema = general_projectModelSchema
  .extend({
    activity: activityWithContactsSchema.optional(),
    user: userSchema.nullable().optional()
  })
  .openapi('GeneralProject');
