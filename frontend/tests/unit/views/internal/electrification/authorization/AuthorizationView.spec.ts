import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import { shallowMount } from '@vue/test-utils';

import AuthorizationView from '@/views/internal/electrification/authorization/AuthorizationView.vue';

// Mock dependencies
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: vi.fn()
  })
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  sessionStorage.clear();
});

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
      ToastService
    ],
    stubs: ['font-awesome-icon', 'router-link']
  }
});

// Tests
describe('AuthorizationView.vue', () => {
  it('renders', () => {
    const wrapper = shallowMount(AuthorizationView, wrapperSettings());

    expect(wrapper).toBeTruthy();
  });
});
