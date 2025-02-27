import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import { shallowMount } from '@vue/test-utils';

import HomeView from '@/views/HomeView.vue';

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
  vi.clearAllMocks();
});

afterEach(() => {
  sessionStorage.clear();
});

const wrapperSettings = () => ({
  global: {
    plugins: [() => PrimeVue, ToastService],
    stubs: ['font-awesome-icon']
  }
});

describe('HomeView.vue', () => {
  it('renders', () => {
    const wrapper = shallowMount(HomeView, wrapperSettings());

    expect(wrapper).toBeTruthy();
  });
});
