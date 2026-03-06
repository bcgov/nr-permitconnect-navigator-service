import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { useForm } from 'vee-validate';
import { shallowMount } from '@vue/test-utils';

import { default as i18n } from '@/i18n';
import ProjectIntakeAssistance from '@/components/housing/project/ProjectIntakeAssistance.vue';

const TestWrapper = {
  components: { ProjectIntakeAssistance },
  setup() {
    useForm(); // provides vee-validate form context
  },
  template: '<ProjectIntakeAssistance  />'
};

const wrapperSettings = () => ({
  global: {
    plugins: [
      createTestingPinia({
        initialState: {}
      }),
      i18n,
      PrimeVue,
      ConfirmationService,
      ToastService
    ],
    stubs: ['font-awesome-icon', 'router-link']
  }
});

describe('ProjectIntakeAssistance.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with the provided props', () => {
    const wrapper = shallowMount(TestWrapper, wrapperSettings());
    expect(wrapper.findComponent(ProjectIntakeAssistance).exists()).toBe(true);
  });
});
