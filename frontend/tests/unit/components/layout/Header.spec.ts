import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import { shallowMount } from '@vue/test-utils';

import Header from '@/components/layout/Header.vue';
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

afterEach(() => {
  sessionStorage.clear();
});

// TODO: Figure out Auth service mocking
describe('Header.vue', () => {
  it('renders', () => {
    const wrapper = shallowMount(Header, {
      global: {
        plugins: [createTestingPinia(), PrimeVue]
      }
    });
    expect(wrapper).toBeTruthy();
  });
});
