import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { mount } from '@vue/test-utils';

import EnquiryCard from '@/components/enquiry/EnquiryCard.vue';
import { userService } from '@/services';
import { ApplicationStatus, EnquirySubmittedMethod, SubmissionType } from '@/utils/enums/projectCommon';

import type { Enquiry, User } from '@/types';

const listUsersSpy = vi.spyOn(userService, 'listUsers');

const currentDate = new Date().toISOString();

// Example Enquiry object
const testEnquiry: Enquiry = {
  enquiryId: 'enquiry123',
  activityId: 'activity456',
  submissionType: SubmissionType.ASSISTANCE,
  submittedAt: '2023-01-01T12:00:00Z',
  submittedBy: 'user123',
  enquiryStatus: ApplicationStatus.NEW,
  submittedMethod: EnquirySubmittedMethod.EMAIL,
  createdBy: 'testCreatedBy',
  createdAt: currentDate,
  updatedBy: 'testUpdatedAt',
  updatedAt: currentDate,
  addedToAts: false,
  atsClientId: 123456,
  atsEnquiryId: 654321
};

listUsersSpy.mockResolvedValue([{ fullName: 'dummyName' }] as User[]);

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
