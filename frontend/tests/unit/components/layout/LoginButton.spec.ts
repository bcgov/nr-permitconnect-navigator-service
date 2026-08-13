import { ref } from 'vue';

import LoginButton from '@/components/layout/LoginButton.vue';
import { RouteName } from '@/utils/enums/application';

import { mockAuthNStore, resetMockAuthNStore } from '../../../mockAuthNStore';
import { mockRouter, resetMockRouter } from '../../../mockRouter';
import { mountComponent } from '../../../mountComponent';

// Mocks

vi.mock('@/store/authnStore', () => ({
  default: () => mockAuthNStore,
  useAuthNStore: () => mockAuthNStore
}));

// `mockRouter` only covers `push`/`replace` -- this component also reads
// `router.currentRoute`, which no other spec needs yet, so it's extended
// locally rather than added to the shared mock.
const mockCurrentRoute = ref<{ name: RouteName | undefined }>({ name: RouteName.INT_HOUSING_PROJECT });

vi.mock('vue-router', () => ({
  useRouter: () => ({ ...mockRouter, currentRoute: mockCurrentRoute })
}));

// Mount

function mountLoginButton() {
  const { wrapper } = mountComponent(LoginButton);

  return { wrapper };
}

beforeEach(() => {
  vi.clearAllMocks();
  resetMockAuthNStore();
  resetMockRouter();
  mockCurrentRoute.value = { name: RouteName.INT_HOUSING_PROJECT };
});

// Tests

describe('LoginButton', () => {
  describe('rendering', () => {
    it('renders a login button on an eligible route while unauthenticated', () => {
      mockAuthNStore.getIsAuthenticated.value = false;
      mockCurrentRoute.value = { name: RouteName.INT_HOUSING_PROJECT };

      const { wrapper } = mountLoginButton();

      expect(wrapper.find('button').exists()).toBe(true);
      expect(wrapper.text()).toContain('Log in');
    });

    it('renders nothing when unauthenticated and no current route is set', () => {
      mockAuthNStore.getIsAuthenticated.value = false;
      mockCurrentRoute.value = { name: undefined };

      const { wrapper } = mountLoginButton();

      expect(wrapper.find('button').exists()).toBe(false);
    });

    it('renders nothing when unauthenticated on an excluded route', () => {
      mockAuthNStore.getIsAuthenticated.value = false;
      mockCurrentRoute.value = { name: RouteName.OIDC_LOGIN };

      const { wrapper } = mountLoginButton();

      expect(wrapper.find('button').exists()).toBe(false);
    });

    it('renders a logout button when authenticated', () => {
      mockAuthNStore.getIsAuthenticated.value = true;

      const { wrapper } = mountLoginButton();

      expect(wrapper.find('button').exists()).toBe(true);
    });
  });

  describe('user interaction', () => {
    it('navigates to the login route when the login button is clicked', async () => {
      mockAuthNStore.getIsAuthenticated.value = false;
      mockCurrentRoute.value = { name: RouteName.INT_HOUSING_PROJECT };

      const { wrapper } = mountLoginButton();
      await wrapper.find('button').trigger('click');

      expect(mockRouter.push).toHaveBeenCalledWith({ name: RouteName.OIDC_LOGIN });
    });

    it('navigates to the logout route when the logout button is clicked', async () => {
      mockAuthNStore.getIsAuthenticated.value = true;

      const { wrapper } = mountLoginButton();
      await wrapper.find('button').trigger('click');

      expect(mockRouter.push).toHaveBeenCalledWith({ name: RouteName.OIDC_LOGOUT });
    });
  });
});
