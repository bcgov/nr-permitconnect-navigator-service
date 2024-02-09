import { Prisma } from '@prisma/client';

import type { Stamps } from '../stamps';
import type { IdentityProvider } from '../../types';

// Define a type
const _identityProvider = Prisma.validator<Prisma.identity_providerDefaultArgs>()({});
type PrismaRelationIdentityProvider = Omit<Prisma.identity_providerGetPayload<typeof _identityProvider>, keyof Stamps>;

export default {
  toPrismaModel(input: IdentityProvider): PrismaRelationIdentityProvider {
    return {
      idp: input.idp,
      active: input.active
    };
  },

  fromPrismaModel(input: PrismaRelationIdentityProvider | null): IdentityProvider | null {
    if (!input) return null;

    return {
      idp: input.idp,
      active: input.active
    };
  }
};
