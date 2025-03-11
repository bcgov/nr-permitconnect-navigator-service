import PrimeVue from 'primevue/config';

import { shallowMount } from '@vue/test-utils';
import NaturalDisasterCard from '@/components/form/common/NaturalDisasterCard.vue';

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

describe('NaturalDisasterCard.vue', () => {
  it('renders', () => {
    const wrapper = shallowMount(NaturalDisasterCard, wrapperSettings());

    expect(wrapper).toBeTruthy();
  });
});
