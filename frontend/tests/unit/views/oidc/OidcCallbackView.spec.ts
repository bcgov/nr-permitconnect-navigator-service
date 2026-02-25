import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestingPinia } from '@pinia/testing';
import { flushPromises, mount } from '@vue/test-utils';

import OidcCallbackView from '@/views/oidc/OidcCallbackView.vue';
import { StorageKey } from '@/utils/enums/application';

import type { MockInstance } from 'vitest';

const mockReplace = vi.fn();

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: mockReplace
  })
}));

const wrapperSettings = () => ({
  global: {
    plugins: [
      () =>
        createTestingPinia({
          initialState: {
            auth: {
              user: {}
            }
          }
        }),
      PrimeVue,
      ConfirmationService,
      ToastService
    ],
    stubs: ['font-awesome-icon', 'Spinner']
  }
});

let mockStorageGet: MockInstance;
let mockStorageRemove: MockInstance;

beforeEach(() => {
  vi.clearAllMocks();

  mockStorageGet = vi.spyOn(globalThis.sessionStorage, 'getItem');
  mockStorageRemove = vi.spyOn(globalThis.sessionStorage, 'removeItem');

  globalThis.sessionStorage.setItem(
    StorageKey.CONFIG,
    JSON.stringify({
      oidc: {
        authority: 'abc',
        clientId: '123'
      }
    })
  );
});

afterEach(() => {
  globalThis.sessionStorage.clear();
  mockStorageGet.mockRestore();
  mockStorageRemove.mockRestore();
});

describe('OidcCallbackView', () => {
  it('renders component', () => {
    const wrapper = mount(OidcCallbackView, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });

  describe('onMounted redirect logic', () => {
    it('removes AUTH key and redirects to entrypoint if it exists', async () => {
      mockStorageGet.mockImplementation((key) => {
        if (key === StorageKey.AUTH) return '/custom-route';
        if (key === StorageKey.CONFIG) return globalThis.sessionStorage.getItem(StorageKey.CONFIG);
        return null;
      });

      mount(OidcCallbackView, wrapperSettings());

      await flushPromises();

      expect(mockStorageRemove).toHaveBeenCalledWith(StorageKey.AUTH);
      expect(mockReplace).toHaveBeenCalledWith('/custom-route');
    });

    it('redirects to root (/) and does not remove AUTH key if entrypoint does not exist', async () => {
      mockStorageGet.mockImplementation((key) => {
        if (key === StorageKey.CONFIG) return globalThis.sessionStorage.getItem(StorageKey.CONFIG);
        return null;
      });

      mount(OidcCallbackView, wrapperSettings());
      await flushPromises();

      expect(mockStorageRemove).not.toHaveBeenCalledWith(StorageKey.AUTH);
      expect(mockReplace).toHaveBeenCalledWith('/');
    });
  });
});
