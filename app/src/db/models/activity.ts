import { Prisma } from '@prisma/client';

import type { Stamps } from '../stamps';
import type { Activity } from '../../types/Activity';

// Define types
const _activity = Prisma.validator<Prisma.activityDefaultArgs>()({});

type PrismaRelationActivity = Omit<Prisma.activityGetPayload<typeof _activity>, keyof Stamps>;

export default {
  toPrismaModel(input: Activity): PrismaRelationActivity {
    return {
      activity_id: input.activityId,
      initiative_id: input.initiativeId
    };
  },

  fromPrismaModel(input: PrismaRelationActivity | null): Activity | null {
    if (!input) return null;

    return {
      activityId: input.activity_id,
      initiativeId: input.initiative_id as string
    };
  }
};
