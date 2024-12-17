import CreateEnquiryDialog from '@/components/housing/projects/CreateEnquiryDialog.vue';
import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { mount } from '@vue/test-utils';

const testConfirmationId = 'activity123';

const wrapperSettings = (testConfirmationIdProp = testConfirmationId) => ({
  props: {
    confirmationId: testConfirmationIdProp
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

describe('CreateEnquiryDialog.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with the provided props', () => {
    const wrapper = mount(CreateEnquiryDialog, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });
});
