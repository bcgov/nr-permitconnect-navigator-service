import { Prisma } from '@prisma/client';

import type { IStamps } from '../../interfaces/IStamps';
import type { IdentityProvider } from '../../types';

// Define a type
const _identityProvider = Prisma.validator<Prisma.identity_providerDefaultArgs>()({});
type DBIdentityProvider = Omit<Prisma.identity_providerGetPayload<typeof _identityProvider>, keyof IStamps>;

export default {
  toDBModel(input: IdentityProvider): DBIdentityProvider {
    return {
      idp: input.idp,
      active: input.active
    };
  },

  fromDBModel(input: DBIdentityProvider | null): IdentityProvider | null {
    if (!input) return null;

    return {
      idp: input.idp,
      active: input.active
    };
  }
};
