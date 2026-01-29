import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { mount } from '@vue/test-utils';

import EnquiryListNavigator from '@/components/enquiry/EnquiryListNavigator.vue';
import { enquiryService } from '@/services';
import { ApplicationStatus, EnquirySubmittedMethod, SubmissionType } from '@/utils/enums/projectCommon';

import type { AxiosResponse } from 'axios';
import type { Enquiry } from '@/types';

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

const deleteEnquirySpy = vi.spyOn(enquiryService, 'deleteEnquiry');
deleteEnquirySpy.mockResolvedValue({ data: {} } as AxiosResponse);
const currentDate = new Date().toISOString();

// Example Enquiry object
const testEnquiry: Enquiry = {
  enquiryId: 'enquiry123',
  activityId: 'activity456',
  submissionType: SubmissionType.GUIDANCE,
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
