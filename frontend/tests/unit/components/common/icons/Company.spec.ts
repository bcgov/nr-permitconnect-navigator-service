import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';

import FinanciallySupported from '@/components/common/icons/FinanciallySupported.vue';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: vi.fn() })
}));

const wrapperSettingsForm = () => ({
  global: {
    plugins: [() => createTestingPinia({ initialState: { auth: { user: {} } } }), PrimeVue]
  }
});

describe('FinanciallySupported.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component', async () => {
    const wrapper = mount(FinanciallySupported, wrapperSettingsForm());
    await nextTick();
    expect(wrapper.exists()).toBe(true);
  });
});
