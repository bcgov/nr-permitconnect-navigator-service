/**
 * Shared authn store mock -- a deliberate exception to the "seed real Pinia
 * state, don't mock the store" rule in TESTING_STANDARDS.md. `useAuthNStore`
 * is a Pinia *setup* store (src/store/authnStore.ts). Even under
 * `createTestingPinia`, only the store's returned actions get auto-stubbed --
 * the setup() body itself still runs for real, unconditionally constructing
 * a real `AuthService` / `oidc-client-ts` `UserManager`. With
 * `monitorSession` on by default, that spins up a `SessionMonitor` whose
 * constructor fires an unawaited `getUser()`, logging "[UserManager] getUser:
 * user not found in storage" to the console in every spec that touches the
 * real store -- there's no way to seed around this short of reconfiguring
 * oidc-client-ts itself, so the store is mocked wholesale instead.
 *
 * Usage in a spec:
 *
 *   vi.mock('@/store/authnStore', () => ({
 *     default: () => mockAuthNStore,
 *     useAuthNStore: () => mockAuthNStore
 *   }));
 *
 *   beforeEach(() => resetMockAuthNStore());
 *
 * Getters are real `ref()`s (not plain values) because the component reads
 * them via Pinia's `storeToRefs()`, which only unwraps ref/reactive/computed
 * values -- a plain `{ value: x }`-shaped property would not be extracted.
 */
import { ref } from 'vue';
import { vi } from 'vitest';

import type { IdTokenClaims, User } from 'oidc-client-ts';

export const mockAuthNStore = {
  getAccessToken: ref<string | undefined>(undefined),
  getClientRoles: ref<string[] | undefined>(undefined),
  getExpiresAt: ref<number | undefined>(undefined),
  getIdentityId: ref<string | undefined>(undefined),
  getIdToken: ref<string | undefined>(undefined),
  getIsAuthenticated: ref(false),
  getProfile: ref<IdTokenClaims | undefined>(undefined),
  getRefreshToken: ref<string | undefined>(undefined),
  getScope: ref<string | undefined>(undefined),
  getUser: ref<User | null>(null),
  init: vi.fn(),
  login: vi.fn(),
  loginCallback: vi.fn(),
  logout: vi.fn()
};

export function resetMockAuthNStore() {
  mockAuthNStore.getAccessToken.value = undefined;
  mockAuthNStore.getClientRoles.value = undefined;
  mockAuthNStore.getExpiresAt.value = undefined;
  mockAuthNStore.getIdentityId.value = undefined;
  mockAuthNStore.getIdToken.value = undefined;
  mockAuthNStore.getIsAuthenticated.value = false;
  mockAuthNStore.getProfile.value = undefined;
  mockAuthNStore.getRefreshToken.value = undefined;
  mockAuthNStore.getScope.value = undefined;
  mockAuthNStore.getUser.value = null;
  mockAuthNStore.init.mockClear();
  mockAuthNStore.login.mockClear();
  mockAuthNStore.loginCallback.mockClear();
  mockAuthNStore.logout.mockClear();
}
