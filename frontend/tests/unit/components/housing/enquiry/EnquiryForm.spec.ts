import EnquiryForm from '@/components/housing/enquiry/EnquiryForm.vue';
import { enquiryService, submissionService, userService } from '@/services';
import { ApplicationStatus } from '@/utils/enums/housing';
import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { shallowMount } from '@vue/test-utils';
import type { AxiosResponse } from 'axios';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: vi.fn()
  })
}));

const useUserService = vi.spyOn(userService, 'searchUsers');
const useEnquiryService = vi.spyOn(enquiryService, 'updateEnquiry');
const useSubmissionService = vi.spyOn(submissionService, 'getActivityIds');

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
  enquiryType: 'General Inquiry',
  submittedAt: '2023-01-01T12:00:00Z',
  submittedBy: 'user123',
  intakeStatus: 'Pending',
  enquiryStatus: ApplicationStatus.NEW,
  contacts: [exampleContact],
  createdBy: 'testCreatedBy',
  createdAt: currentDate,
  updatedBy: 'testUpdatedAt',
  updatedAt: currentDate
};

useUserService.mockResolvedValue({ data: [{ fullName: 'dummyName' }] } as AxiosResponse);
useEnquiryService.mockResolvedValue({ data: { enquiryId: 'enquiry123', activityId: 'activity456' } } as AxiosResponse);
useSubmissionService.mockResolvedValue({ data: ['activity1', 'activity2'] } as AxiosResponse);
const wrapperSettings = (testEnquiryProp = testEnquiry) => ({
  props: {
    enquiry: testEnquiryProp
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

describe('EnquiryForm.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with the provided props', () => {
    const wrapper = shallowMount(EnquiryForm, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });
});
