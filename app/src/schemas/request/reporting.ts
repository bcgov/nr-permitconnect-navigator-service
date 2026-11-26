import { z } from 'zod';

import { Initiative } from '#src/utils/enums/application';

export const schema = {
  getDashboard: {
    query: z.object({ initiative: z.enum(Initiative) }).strict()
  }
};
