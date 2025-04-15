import { Prisma } from '@prisma/client';

import type { Stamps } from '../stamps';
import type { ActivityContact } from '../../types';

// Define types
const _activityContact = Prisma.validator<Prisma.activity_contactDefaultArgs>()({});

type PrismaRelationActivtyContact = Omit<Prisma.activity_contactGetPayload<typeof _activityContact>, keyof Stamps>;

export default {
  toPrismaModel(input: ActivityContact): PrismaRelationActivtyContact {
    return {
      activity_id: input.activityId,
      contact_id: input.contactId
    };
  },

  fromPrismaModel(input: PrismaRelationActivtyContact): ActivityContact {
    return {
      activityId: input.activity_id,
      contactId: input.contact_id
    };
  }
};
