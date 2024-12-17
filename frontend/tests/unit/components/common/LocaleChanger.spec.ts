import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import { mount } from '@vue/test-utils';

import LocaleChanger from '@/components/common/LocaleChanger.vue';

// Mock dependencies
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    locale: vi.fn()
  })
}));

vi.mock('@/i18n', () => ({
  SUPPORT_LOCALES: ['en-CA']
}));

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
      PrimeVue
    ],
    stubs: ['vue-i18n', '@/i18n']
  }
});

describe('LocaleChanger.vue', () => {
  it('renders', () => {
    const wrapper = mount(LocaleChanger, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });
});
