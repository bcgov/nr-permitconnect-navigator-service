import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import { shallowMount } from '@vue/test-utils';

import ContactPageView from '@/views/internal/ContactPageView.vue';
import { Initiative } from '@/utils/enums/application';

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

const wrapperSettings = (contactId: string) => ({
  props: {
    contactId
  },
  global: {
    plugins: [
      () =>
        createTestingPinia({
          initialState: {
            app: {
              initiative: Initiative.HOUSING
            }
          }
        }),
      PrimeVue,
      ToastService
    ]
  }
});

// Tests
beforeEach(() => {
  vi.clearAllMocks();
});

describe('ContactPageView.vue', () => {
  it('renders', () => {
    const wrapper = shallowMount(ContactPageView, wrapperSettings('123'));
    expect(wrapper).toBeTruthy();
  });
});
