import type { IdentityProviderKind } from '@/utils/enums/application';

export interface IdentityProvider {
  idp: string;
  kind: IdentityProviderKind;
  username: string;
}
