import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import { mount } from '@vue/test-utils';

import HeaderMenu from '@/components/common/HeaderMenu.vue';
import { StorageKey } from '@/utils/enums/application';

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

beforeEach(() => {
  sessionStorage.setItem(
    StorageKey.CONFIG,
    JSON.stringify({
      oidc: {
        authority: 'abc',
        clientId: '123'
      }
    })
  );

  vi.clearAllMocks();
});

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
    stubs: ['font-awesome-icon', 'vue-i18n', 'router-link']
  }
});

describe('HeaderMenu.vue', () => {
  it('renders', () => {
    const wrapper = mount(HeaderMenu, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });
});
