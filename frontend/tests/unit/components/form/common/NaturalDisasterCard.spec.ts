import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';

import { default as i18n } from '@/i18n';
import { shallowMount } from '@vue/test-utils';
import NaturalDisasterCard from '@/components/form/common/NaturalDisasterCard.vue';

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  sessionStorage.clear();
});

const wrapperSettings = () => ({
  props: {},
  global: {
    plugins: [
      createTestingPinia({
        initialState: {}
      }),
      i18n,
      PrimeVue
    ],
    stubs: ['font-awesome-icon']
  }
});

describe('NaturalDisasterCard.vue', () => {
  it('renders', () => {
    const wrapper = shallowMount(NaturalDisasterCard, wrapperSettings());

    expect(wrapper).toBeTruthy();
  });
});
