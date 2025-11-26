import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { mount } from '@vue/test-utils';

import ATSInfo from '@/components/ats/ATSInfo.vue';

const testFName = 'John';
const testLName = 'Doe';
const testPhoneNumber = '123-456-7890';
const testEmailId = 'test@example.com';
const testATSClientId = 13421;
const testATSEnquiryId = 56789;

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: vi.fn()
  })
}));

const wrapperSettings = (
  atsClientId: number = testATSClientId,
  atsEnquiryId: number = testATSEnquiryId,
  firstName: string = testFName,
  lastName: string = testLName,
  phoneNumber: string = testPhoneNumber,
  email: string = testEmailId
) => ({
  props: {
    atsClientId,
    atsEnquiryId,
    firstName,
    lastName,
    phoneNumber,
    email
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

describe('ATSInfo.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with the provided props', () => {
    const wrapper = mount(ATSInfo, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });
});
