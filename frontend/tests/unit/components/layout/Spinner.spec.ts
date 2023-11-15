import { shallowMount } from '@vue/test-utils';

import Spinner from '@/components/layout/Spinner.vue';
import PrimeVue from 'primevue/config';

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  sessionStorage.clear();
});

describe('Spinner.vue', async () => {
  it('renders', () => {
    const wrapper = shallowMount(Spinner, {
      global: {
        plugins: [PrimeVue]
      }
    });

    expect(wrapper).toBeTruthy();
  });
});
