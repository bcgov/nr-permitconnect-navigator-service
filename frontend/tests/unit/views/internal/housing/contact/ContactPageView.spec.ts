import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import { shallowMount } from '@vue/test-utils';

import ContactPageView from '@/views/internal/housing/contact/ContactPageView.vue';

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
describe('ContactPageView.vue', () => {
  it('renders', () => {
    const wrapper = shallowMount(ContactPageView, wrapperSettings());

    expect(wrapper).toBeTruthy();
  });
});
