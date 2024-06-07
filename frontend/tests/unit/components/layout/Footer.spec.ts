import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import { mount, shallowMount } from '@vue/test-utils';

import Footer from '@/components/layout/Footer.vue';
import { StorageKey } from '@/utils/enums/application';

// Mock router calls
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

describe('Footer.vue', () => {
  it('renders', () => {
    const wrapper = shallowMount(Footer, {
      global: {
        plugins: [createTestingPinia(), PrimeVue]
      }
    });
    expect(wrapper).toBeTruthy();
  });

  it('contains 7 links', () => {
    const wrapper = mount(Footer, {
      global: {
        plugins: [createTestingPinia(), PrimeVue]
      }
    });
    const links = wrapper.findAll('a');
    expect(links).toHaveLength(7);
  });
});
