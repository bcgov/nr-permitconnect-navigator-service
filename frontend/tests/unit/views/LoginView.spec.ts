import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import { mount } from '@vue/test-utils';

import LoginView from '@/views/LoginView.vue';

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

describe('LoginView.vue', () => {
  it('renders', () => {
    const wrapper = mount(LoginView, wrapperSettings());

    expect(wrapper).toBeTruthy();
  });
});
