import { defineStore } from 'pinia';
import { computed, readonly, ref } from 'vue';

import { AuthService } from '@/services';

import type { IdTokenClaims, User } from 'oidc-client-ts';
import type { Ref } from 'vue';

export type AuthNStoreState = {
  accessToken: Ref<string | undefined>;
  expiresAt: Ref<number | undefined>;
  identityId: Ref<string | undefined>;
  idToken: Ref<string | undefined>;
  isAuthenticated: Ref<boolean>;
  profile: Ref<IdTokenClaims | undefined>;
  refreshToken: Ref<string | undefined>;
  roleOverride: Ref<string | undefined>;
  scope: Ref<string | undefined>;
  user: Ref<User | null>;
};

export const useAuthNStore = defineStore('authn', () => {
  const authService = new AuthService();
  const userManager = authService.getUserManager();

  // State
  const state: AuthNStoreState = {
    accessToken: ref(undefined),
    expiresAt: ref(0),
    identityId: ref(undefined),
    idToken: ref(undefined),
    isAuthenticated: ref(false),
    profile: ref(undefined),
    refreshToken: ref(undefined),
    roleOverride: ref(undefined),
    scope: ref(undefined),
    user: ref(null)
  };

  // Getters
  const getters = {
    getAccessToken: computed(() => state.accessToken.value),
    getClientRoles: computed(() => state.user.value?.profile.client_roles as string[]),
    getExpiresAt: computed(() => state.expiresAt.value),
    getIdentityId: computed(() => state.identityId.value),
    getIdToken: computed(() => state.idToken.value),
    getIsAuthenticated: computed(() => state.isAuthenticated.value),
    getProfile: computed(() => state.profile.value),
    getRefreshToken: computed(() => state.refreshToken.value),
    getScope: computed(() => state.scope.value),
    getUser: computed(() => state.user.value)
  };

  // Actions
  function _registerEvents() {
    userManager.events.addAccessTokenExpired(_updateState);
    userManager.events.addAccessTokenExpiring(_updateState);
    userManager.events.addSilentRenewError(_updateState);
    userManager.events.addUserLoaded(_updateState);
    userManager.events.addUserSessionChanged(_updateState);
    userManager.events.addUserSignedIn(_updateState);
    userManager.events.addUserSignedOut(_updateState);
    userManager.events.addUserUnloaded(_updateState);
  }

  async function _updateState() {
    const user = await authService.getUser();
    const profile = user?.profile;
    const isAuthenticated = !!user && !user.expired;
    const identityId = profile?.sub;

    state.accessToken.value = user?.access_token;
    state.expiresAt.value = user?.expires_at;
    state.identityId.value = identityId;
    state.idToken.value = user?.id_token;
    state.isAuthenticated.value = isAuthenticated;
    state.profile.value = profile;
    state.refreshToken.value = user?.refresh_token;
    state.scope.value = user?.scope;
    state.user.value = user;
  }

  async function init() {
    await AuthService.init();
    _registerEvents();
    await _updateState();
  }

  async function login(idp: string) {
    return authService.login(idp);
  }

  async function loginCallback() {
    return authService.loginCallback();
  }

  async function logout() {
    return authService.logout();
  }

  return {
    // State
    state: readonly(state),

    // Getters
    ...getters,

    // Actions
    _registerEvents,
    _updateState,
    init,
    login,
    loginCallback,
    logout
  };
});

export default useAuthNStore;
