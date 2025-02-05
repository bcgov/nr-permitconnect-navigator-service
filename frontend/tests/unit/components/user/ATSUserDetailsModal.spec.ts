import ATSUserDetailsModal from '@/components/user/ATSUserDetailsModal.vue';
import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { mount } from '@vue/test-utils';

const testATSClientNumber = '123456';

const wrapperSettings = (testATSClientNumberProp = testATSClientNumber) => ({
  props: {
    atsClientNumber: testATSClientNumberProp,
    disabled: false
  },
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
      PrimeVue,
      ConfirmationService,
      ToastService
    ],
    stubs: ['font-awesome-icon', 'router-link']
  }
});

describe('ATSUserDetailsModal.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with the provided props', () => {
    const wrapper = mount(ATSUserDetailsModal, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });
});
