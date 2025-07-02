import { shallowMount } from '@vue/test-utils';

import PermitStatusDescriptionModal from '@/components/permit/PermitStatusDescriptionModal.vue';
import PrimeVue from 'primevue/config';

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  sessionStorage.clear();
});

describe('PermitStatusDescriptionModal.vue', () => {
  it('renders', () => {
    const wrapper = shallowMount(PermitStatusDescriptionModal, {
      global: {
        plugins: [PrimeVue]
      }
    });

    expect(wrapper).toBeTruthy();
  });
});
