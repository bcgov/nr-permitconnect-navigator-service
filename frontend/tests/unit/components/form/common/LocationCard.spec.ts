import PrimeVue from 'primevue/config';

import { shallowMount } from '@vue/test-utils';
import LocationCard from '@/components/form/common/LocationCard.vue';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: vi.fn()
  })
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  sessionStorage.clear();
});

const wrapperSettings = () => ({
  props: {},
  global: {
    plugins: [PrimeVue],
    stubs: ['font-awesome-icon']
  }
});

describe('LocationCard.vue', () => {
  it('renders', () => {
    const wrapper = shallowMount(LocationCard, wrapperSettings());

    expect(wrapper).toBeTruthy();
  });
});
