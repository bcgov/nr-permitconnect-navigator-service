import { shallowMount } from '@vue/test-utils';

import CancelButton from '@/components/form/CancelButton.vue';
import PrimeVue from 'primevue/config';

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  sessionStorage.clear();
});

describe('CancelButton.vue', () => {
  it('renders', () => {
    const wrapper = shallowMount(CancelButton, {
      global: {
        plugins: [PrimeVue]
      }
    });

    expect(wrapper).toBeTruthy();
  });
});
