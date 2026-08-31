import { z } from 'zod';

import { activityId, uuidv4 } from './common.ts';
import { validate } from '#src/middleware/validation';
import { ActivityContactRole } from '#src/utils/enums/projectCommon';

const role = z.enum(Object.values(ActivityContactRole) as [string, ...string[]]);

export const schema = {
  createActivityContact: {
    params: z.object({
      activityId: activityId,
      contactId: uuidv4
    }),
    body: z.object({
      role: role
    })
  },

  deleteActivityContact: {
    params: z.object({
      activityId: activityId,
      contactId: uuidv4
    })
  },

  listActivityContact: {
    params: z.object({
      activityId: activityId
    })
  },

  updateActivityContact: {
    params: z.object({
      activityId: activityId,
      contactId: uuidv4
    }),
    body: z.object({
      role: role
    })
  }
};

export default {
  createActivityContact: validate(schema.createActivityContact),
  deleteActivityContact: validate(schema.deleteActivityContact),
  listActivityContact: validate(schema.listActivityContact),
  updateActivityContact: validate(schema.updateActivityContact)
};
