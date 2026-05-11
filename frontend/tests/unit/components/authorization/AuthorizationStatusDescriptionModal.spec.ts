import { shallowMount } from '@vue/test-utils';
import { createPinia } from 'pinia';

import AuthorizationStatusDescriptionModal from '@/components/authorization/AuthorizationStatusDescriptionModal.vue';
import PrimeVue from 'primevue/config';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: vi.fn()
  })
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  sessionStorage.clear();
});

describe('AuthorizationStatusDescriptionModal.vue', () => {
  it('renders', () => {
    const wrapper = shallowMount(AuthorizationStatusDescriptionModal, {
      global: {
        plugins: [PrimeVue, createPinia()]
      }
    });

    expect(wrapper).toBeTruthy();
  });
});
