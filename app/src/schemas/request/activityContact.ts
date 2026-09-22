import { z } from 'zod';

import { activityId, uuidv4 } from './common.ts';
import { ActivityContactRole } from '#src/utils/enums/projectCommon';

const role = z.enum(Object.values(ActivityContactRole) as [string, ...string[]]);

export const schema = {
  createActivityContact: {
    params: z
      .object({
        activityId: activityId,
        contactId: uuidv4
      })
      .strict(),
    body: z.object({ role: role }).strict()
  },

  deleteActivityContact: {
    params: z
      .object({
        activityId: activityId,
        contactId: uuidv4
      })
      .strict()
  },

  listActivityContact: {
    params: z
      .object({
        activityId: activityId
      })
      .strict()
  },

  updateActivityContact: {
    params: z
      .object({
        activityId: activityId,
        contactId: uuidv4
      })
      .strict(),
    body: z.object({ role: role }).strict()
  }
};
