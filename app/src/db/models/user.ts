import { Prisma } from '@prisma/client';

import type { IStamps } from '../../interfaces/IStamps';
import type { User } from '../../types/User';

// Define types
const _user = Prisma.validator<Prisma.userDefaultArgs>()({});

type PrismaRelationUser = Omit<Prisma.userGetPayload<typeof _user>, keyof IStamps>;

export default {
  toPrismaModel(input: User): PrismaRelationUser {
    return {
      userId: input.userId as string,
      identityId: input.identityId,
      idp: input.idp,
      username: input.username,
      email: input.email,
      firstName: input.firstName,
      fullName: input.fullName,
      lastName: input.lastName,
      active: input.active
    };
  },

  fromPrismaModel(input: PrismaRelationUser | null): User | null {
    if (!input) return null;

    return {
      userId: input.userId,
      identityId: input.identityId as string,
      idp: input.idp,
      username: input.username,
      email: input.email,
      firstName: input.firstName,
      fullName: input.fullName,
      lastName: input.lastName,
      active: input.active
    };
  }
};
