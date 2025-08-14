import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { mount } from '@vue/test-utils';

import EnquiryListNavigator from '@/components/projectCommon/enquiry/EnquiryListNavigator.vue';
import { enquiryService } from '@/services';
import { ApplicationStatus, EnquirySubmittedMethod } from '@/utils/enums/projectCommon';

import type { AxiosResponse } from 'axios';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: vi.fn()
  })
}));
vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({
    query: {}
  })),
  useRouter: vi.fn(() => ({
    push: vi.fn()
  }))
}));

const useEnquiryService = vi.spyOn(enquiryService, 'updateIsDeletedFlag');
useEnquiryService.mockResolvedValue({ data: { enquiryId: 'enquiry123', activityId: 'activity456' } } as AxiosResponse);
const currentDate = new Date().toISOString();

const exampleContact = {
  contactId: 'contact123',
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '123-456-7890'
};

// Example Enquiry object
const testEnquiry = {
  enquiryId: 'enquiry123',
  activityId: 'activity456',
  submissionType: 'General Inquiry',
  submittedAt: '2023-01-01T12:00:00Z',
  submittedBy: 'user123',
  intakeStatus: 'Pending',
  enquiryStatus: ApplicationStatus.NEW,
  submittedMethod: EnquirySubmittedMethod.EMAIL,
  contacts: [exampleContact],
  createdBy: 'testCreatedBy',
  createdAt: currentDate,
  updatedBy: 'testUpdatedAt',
  updatedAt: currentDate,
  addedToAts: false,
  atsClientId: 123456,
  atsEnquiryId: '654321'
};

const testEnquiries = [testEnquiry];
const wrapperSettings = (testEnquiriesProp = testEnquiries, loading = false) => ({
  props: {
    enquiries: testEnquiriesProp,
    loading: loading
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

describe('EnquiryListNavigator.vue', () => {
  it('renders the component with the provided props', () => {
    const wrapper = mount(EnquiryListNavigator, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });
});
