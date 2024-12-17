import { createTestingPinia } from '@pinia/testing';
import { shallowMount } from '@vue/test-utils';

import SubmissionsView from '@/views/housing/SubmissionsView.vue';
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
    stubs: ['font-awesome-icon', 'router-link']
  }
});

describe('SubmissionsView.vue', () => {
  it('renders', () => {
    const wrapper = shallowMount(SubmissionsView, wrapperSettings());

    expect(wrapper).toBeTruthy();
  });
});
