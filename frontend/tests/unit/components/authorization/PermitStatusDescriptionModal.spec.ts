import { shallowMount } from '@vue/test-utils';

import AuthorizationStatusDescriptionModal from '@/components/authorization/AuthorizationStatusDescriptionModal.vue';
import PrimeVue from 'primevue/config';

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
        plugins: [PrimeVue]
      }
    });

    expect(wrapper).toBeTruthy();
  });
});
