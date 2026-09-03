import { z } from 'zod';

import { validate } from '#src/middleware/validation';
import { GroupName, Initiative } from '#src/utils/enums/application';

export const schema = {
  getGroups: {
    query: z
      .object({
        initiative: z.enum(Object.values(Initiative) as [string, ...string[]])
      })
      .strict()
  },
  listPermissions: {
    query: z
      .object({
        initiative: z.enum(Object.values(Initiative) as [string, ...string[]]),
        groupName: z.enum(Object.values(GroupName) as [string, ...string[]])
      })
      .strict()
  },
  deleteSubjectGroup: {
    body: z
      .object({
        sub: z.string(),
        groupId: z.number()
      })
      .strict()
  }
};

export default {
  getGroups: validate(schema.getGroups),
  listPermissions: validate(schema.listPermissions),
  deleteSubjectGroup: validate(schema.deleteSubjectGroup)
};
