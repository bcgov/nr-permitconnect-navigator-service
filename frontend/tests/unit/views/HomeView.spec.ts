import { shallowMount } from '@vue/test-utils';

import HomeView from '@/views/HomeView.vue';
import PrimeVue from 'primevue/config';

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
    plugins: [() => PrimeVue],
    stubs: ['font-awesome-icon']
  }
});

describe('HomeView.vue', () => {
  it('renders', () => {
    const wrapper = shallowMount(HomeView, wrapperSettings());

    expect(wrapper).toBeTruthy();
  });
});
