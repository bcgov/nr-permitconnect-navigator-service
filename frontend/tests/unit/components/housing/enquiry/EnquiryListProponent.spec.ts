import EnquiryListProponent from '@/components/housing/enquiry/EnquiryListProponent.vue';
import { enquiryService } from '@/services';
import { createTestingPinia } from '@pinia/testing';
import type { AxiosResponse } from 'axios';

import { ApplicationStatus } from '@/utils/enums/housing';

import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { mount } from '@vue/test-utils';

// Mock dependencies
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
  enquiryType: 'General Inquiry',
  submittedAt: '2023-01-01T12:00:00Z',
  submittedBy: 'user123',
  intakeStatus: 'Pending',
  enquiryStatus: ApplicationStatus.NEW,
  contacts: [exampleContact],
  createdBy: 'testCreatedBy',
  createdAt: currentDate,
  updatedBy: 'testUpdatedAt',
  updatedAt: currentDate,
  addedToATS: false,
  atsClientNumber: 'atsClientNumber123'
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

describe('EnquiryListProponent.vue', () => {
  it('renders the component with the provided props', () => {
    const wrapper = mount(EnquiryListProponent, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });
});
