import { Prisma } from '@prisma/client';

import type { IdentityProvider } from '../../types';

// Define a type
const _identityProvider = Prisma.validator<Prisma.identity_providerDefaultArgs>()({});
type identity_provider = Prisma.identity_providerGetPayload<typeof _identityProvider>;

export default {
  toPhysicalModel(input: IdentityProvider) {
    return {
      ...input
    };
  },

  toLogicalModel(input: identity_provider): IdentityProvider {
    return {
      idp: input.idp,
      active: input.active
    };
  }
};
