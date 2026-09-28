import { z } from 'zod';

import { Initiative } from '#src/utils/enums/application';

export const schema = {
  listPermitTypes: {
    query: z
      .object({
        initiative: z.enum(Object.keys(Initiative) as [string, ...string[]]).nullish()
      })
      .strict()
  }
};
