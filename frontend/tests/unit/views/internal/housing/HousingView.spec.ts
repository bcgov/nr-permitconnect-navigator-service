import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import { shallowMount } from '@vue/test-utils';

import HousingView from '@/views/internal/housing/HousingView.vue';

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

describe('HousingView.vue', () => {
  it('renders', () => {
    const wrapper = shallowMount(HousingView, wrapperSettings());

    expect(wrapper).toBeTruthy();
  });
});
