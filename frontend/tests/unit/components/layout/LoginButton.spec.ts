import { createTestingPinia } from '@pinia/testing';
import { mount, shallowMount } from '@vue/test-utils';
import { useRouter, useRoute } from 'vue-router';

import PrimeVue from 'primevue/config';
import LoginButton from '@/components/layout/LoginButton.vue';
import { RouteName, StorageKey } from '@/utils/enums/application';

import type { RouteLocationNormalizedLoaded, Router } from 'vue-router';

// Mock router calls
vi.mock('vue-router', () => ({
  useRoute: vi.fn(),
  useRouter: vi.fn(() => ({
    push: () => {}
  }))
}));

beforeEach(() => {
  sessionStorage.setItem(
    StorageKey.CONFIG,
    JSON.stringify({
      oidc: {
        authority: 'abc',
        clientId: '123'
      }
    })
  );

  vi.clearAllMocks();
});

afterEach(() => {
  sessionStorage.clear();
});

describe.todo('LoginButton.vue', () => {
  it('renders', () => {
    const wrapper = shallowMount(LoginButton, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              auth: { user: {} }
            }
          }),
          PrimeVue
        ]
      }
    });
    expect(wrapper).toBeTruthy();
  });

  describe('unauthenticated', () => {
    it('renders login button', () => {
      const wrapper = mount(LoginButton, {
        global: {
          plugins: [
            createTestingPinia({
              initialState: {
                auth: { isAuthenticated: false }
              }
            }),
            PrimeVue
          ]
        }
      });

      const btn = wrapper.getComponent({ name: 'Button' });
      expect(btn.text()).toBe('Log in');
    });

    it('navigates to login on click', async () => {
      vi.mocked(useRoute).mockImplementation(
        () =>
          ({
            params: { name: RouteName.OIDC_LOGIN }
          }) as Partial<RouteLocationNormalizedLoaded> as RouteLocationNormalizedLoaded
      );

      const push = vi.fn();
      vi.mocked(useRouter).mockReturnValue({
        push
      } as Partial<Router> as Router);

      const wrapper = shallowMount(LoginButton, {
        global: {
          plugins: [
            createTestingPinia({
              initialState: {
                auth: { isAuthenticated: false }
              }
            }),
            PrimeVue
          ],
          stubs: ['router-link', 'router-view']
        }
      });

      const btn = wrapper.getComponent({ name: 'Button' });
      await btn.trigger('click');
      expect(push).toBeCalledTimes(1);
      expect(push).toBeCalledWith({ name: RouteName.OIDC_LOGIN });
    });
  });

  describe('authenticated', () => {
    it('renders logout button', () => {
      const wrapper = mount(LoginButton, {
        global: {
          plugins: [
            createTestingPinia({
              initialState: {
                auth: { isAuthenticated: true }
              }
            }),
            PrimeVue
          ]
        }
      });

      const btn = wrapper.getComponent({ name: 'Button' });
      expect(btn.text()).toBe('Log out');
    });

    it('navigates to logout on click', async () => {
      vi.mocked(useRoute).mockImplementation(
        () =>
          ({
            params: { name: RouteName.OIDC_LOGOUT }
          }) as Partial<RouteLocationNormalizedLoaded> as RouteLocationNormalizedLoaded
      );

      const push = vi.fn();
      vi.mocked(useRouter).mockReturnValue({
        push
      } as Partial<Router> as Router);

      const wrapper = shallowMount(LoginButton, {
        global: {
          plugins: [
            createTestingPinia({
              initialState: {
                auth: { isAuthenticated: true }
              }
            }),
            PrimeVue
          ],
          stubs: ['router-link', 'router-view']
        }
      });

      const btn = wrapper.getComponent({ name: 'Button' });
      await btn.trigger('click');
      expect(push).toBeCalledTimes(1);
      expect(push).toBeCalledWith({ name: RouteName.OIDC_LOGOUT });
    });
  });
});
