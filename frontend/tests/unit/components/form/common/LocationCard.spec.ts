import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import { useForm } from 'vee-validate';

import { default as i18n } from '@/i18n';
import { shallowMount } from '@vue/test-utils';
import LocationCard from '@/components/form/common/LocationCard.vue';

const TestWrapper = {
  components: { LocationCard },
  props: ['activeStep'],
  setup() {
    useForm(); // provides vee-validate form context
  },
  template: '<LocationCard :activeStep="activeStep" />'
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  sessionStorage.clear();
});

const wrapperSettings = () => ({
  props: {
    activeStep: 0
  },
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

describe('LocationCard.vue', () => {
  it('renders', () => {
    const wrapper = shallowMount(TestWrapper, wrapperSettings());

    expect(wrapper.findComponent(LocationCard).exists()).toBe(true);
  });
});
