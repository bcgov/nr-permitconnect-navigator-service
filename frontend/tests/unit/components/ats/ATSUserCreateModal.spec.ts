import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { mount } from '@vue/test-utils';

import ATSUserCreateModal from '@/components/ats/ATSUserCreateModal.vue';

const testFirstName = 'John';
const testLastName = 'Doe';
const testAddress = '123 Main St, Anytown, BC';
const testPhone = '123-456-7890';
const testEmail = 'test@example.com';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: vi.fn()
  })
}));

const wrapperSettings = (
  firstName: string = testFirstName,
  lastName: string = testLastName,
  address: string = testAddress,
  phone: string = testPhone,
  email: string = testEmail
) => ({
  props: {
    firstName,
    lastName,
    address,
    phone,
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

describe('ATSUserCreateModal.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with the provided props, a project', () => {
    const wrapper = mount(ATSUserCreateModal, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });

  it('renders the component with the provided props, an enquiry', () => {
    const wrapper = mount(ATSUserCreateModal, wrapperSettings(testFirstName, testLastName, testPhone, testEmail));
    expect(wrapper).toBeTruthy();
  });
});
