import { z } from 'zod';

import '#src/schemas/openapi';
import { userModelSchema } from '#prismaZod';
import { GroupName } from '#src/utils/enums/application';

const groupSchema = z.object({
  groupId: z.number(),
  initiativeCode: z.string(),
  initiativeId: z.string(),
  name: z.enum(Object.values(GroupName) as [string, ...string[]]),
  label: z.string()
});

// search() doesn't include identityProvider, and only attaches groups when group filters or
// includeUserGroups are requested - see src/services/user.ts, src/repositories/user.ts.
export const userSchema = userModelSchema
  .omit({
    accessRequest: true,
    contact: true,
    electrificationProject: true,
    enquiry: true,
    generalProject: true,
    housingProject: true,
    identityProvider: true
  })
  .extend({ groups: z.array(groupSchema).optional() })
  .openapi('User');
