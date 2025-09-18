import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';

import AddLocation from '@/components/common/icons/AddLocation.vue';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: vi.fn() })
}));

const wrapperSettingsForm = () => ({
  global: {
    plugins: [() => createTestingPinia({ initialState: { auth: { user: {} } } }), PrimeVue]
  }
});

describe('AddLocation.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component', async () => {
    const wrapper = mount(AddLocation, wrapperSettingsForm());
    await nextTick();
    expect(wrapper.exists()).toBe(true);
  });
});
