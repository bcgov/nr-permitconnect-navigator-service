import { Prisma } from '@prisma/client';

import type { User } from '../../types';

// Define a type
const _user = Prisma.validator<Prisma.userDefaultArgs>()({});
type user = Prisma.userGetPayload<typeof _user>;

export default {
  toPhysicalModel(input: User) {
    return {
      userId: input.userId as string,
      ...input
    };
  },

  toLogicalModel(input: user): User {
    return {
      userId: input.userId,
      identityId: input.userId,
      idp: input.idp ?? undefined,
      username: input.username,
      email: input.email ?? undefined,
      firstName: input.firstName ?? undefined,
      fullName: input.fullName ?? undefined,
      lastName: input.lastName ?? undefined,
      active: input.active
    };
  }
};
