import { mount } from '@vue/test-utils';

import UserProcessModal from '@/components/user/UserProcessModal.vue';
import PrimeVue from 'primevue/config';

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  sessionStorage.clear();
});

describe('UserProcessModal.vue', () => {
  it('renders', () => {
    const wrapper = mount(UserProcessModal, {
      global: {
        plugins: [PrimeVue]
      }
    });

    expect(wrapper).toBeTruthy();
  });
});
