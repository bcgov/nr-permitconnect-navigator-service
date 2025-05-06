import { Prisma } from '@prisma/client';

import type { Stamps } from '../stamps';
import type { User } from '../../types/User';

// Define types
const _user = Prisma.validator<Prisma.userDefaultArgs>()({});

type PrismaRelationUser = Omit<Prisma.userGetPayload<typeof _user>, keyof Stamps>;

export default {
  toPrismaModel(input: User): PrismaRelationUser {
    return {
      bceid_business_name: input.bceidBusinessName,
      user_id: input.userId as string,
      idp: input.idp,
      sub: input.sub,
      email: input.email,
      first_name: input.firstName,
      full_name: input.fullName,
      last_name: input.lastName,
      active: input.active
    };
  },

  fromPrismaModel(input: PrismaRelationUser): User {
    return {
      bceidBusinessName: input.bceid_business_name,
      userId: input.user_id,
      idp: input.idp,
      sub: input.sub,
      email: input.email,
      firstName: input.first_name,
      fullName: input.full_name,
      lastName: input.last_name,
      active: input.active
    };
  }
};
