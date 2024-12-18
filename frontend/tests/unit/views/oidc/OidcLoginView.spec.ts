import { createTestingPinia } from '@pinia/testing';
import { mount } from '@vue/test-utils';

import OidcLoginView from '@/views/oidc/OidcLoginView.vue';
import { StorageKey } from '@/utils/enums/application';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
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
    stubs: ['font-awesome-icon']
  }
});

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

describe('OidcLoginView', () => {
  it('renders component', () => {
    const wrapper = mount(OidcLoginView, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });
});
