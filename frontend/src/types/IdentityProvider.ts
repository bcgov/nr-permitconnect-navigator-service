import type { IdentityProviderKind } from '@/utils/enums/application';

export type IdentityProvider = {
  idp: string;
  kind: IdentityProviderKind;
  username: string;
};
