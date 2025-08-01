import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { mount } from '@vue/test-utils';

import EnquiryCard from '@/components/projectCommon/enquiry/EnquiryCard.vue';
import { userService } from '@/services';
import { ApplicationStatus, EnquirySubmittedMethod } from '@/utils/enums/projectCommon';

import type { AxiosResponse } from 'axios';

const useUserService = vi.spyOn(userService, 'searchUsers');

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
  addedToATS: false,
  atsClientId: 123456,
  atsEnquiryId: '654321'
};

useUserService.mockResolvedValue({ data: [{ fullName: 'dummyName' }] } as AxiosResponse);

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

describe('EnquiryCard.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with the provided props', () => {
    const wrapper = mount(EnquiryCard, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });
});
