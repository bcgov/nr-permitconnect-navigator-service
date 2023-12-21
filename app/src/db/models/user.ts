import { Prisma } from '@prisma/client';

import type { IStamps } from '../../interfaces/IStamps';
import type { User } from '../../types';

// Define types
const _user = Prisma.validator<Prisma.userDefaultArgs>()({});
type DBUser = Omit<Prisma.userGetPayload<typeof _user>, keyof IStamps>;

export default {
  toDBModel(input: User): DBUser {
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

  fromDBModel(input: DBUser | null): User | null {
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
