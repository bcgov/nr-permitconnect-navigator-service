import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { mount } from '@vue/test-utils';

import ATSUserLinkModal from '@/components/ats/ATSUserLinkModal.vue';

const testFName = 'John';
const testLName = 'Doe';
const testPhoneNumber = '123-456-7890';
const testEmailId = 'test@example.com';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: vi.fn()
  })
}));

const wrapperSettings = (
  fName: string = testFName,
  lName: string = testLName,
  phoneNumber: string = testPhoneNumber,
  emailId: string = testEmailId
) => ({
  props: {
    fName,
    lName,
    phoneNumber,
    emailId
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

describe('ATSUserLinkModal.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with the provided props', () => {
    const wrapper = mount(ATSUserLinkModal, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });
});
