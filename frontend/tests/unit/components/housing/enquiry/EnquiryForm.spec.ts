import { nextTick } from 'vue';

import EnquiryForm from '@/components/housing/enquiry/EnquiryForm.vue';
import { enquiryService, submissionService, userService } from '@/services';
import { ApplicationStatus } from '@/utils/enums/housing';
import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { flushPromises, mount, shallowMount } from '@vue/test-utils';

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

vi.mock(import('vue-router'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    push: vi.fn(),
    onBeforeRouteLeave: vi.fn()
  };
});

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
    stubs: ['font-awesome-icon', 'router-link', 'form-navigation-guard']
  }
});

describe('EnquiryForm.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with the provided props', () => {
    const wrapper = mount(EnquiryForm, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });

  it('renders the correct amount of dropdowns', async () => {
    const wrapper = mount(EnquiryForm, wrapperSettings());
    await nextTick();

    const elements = wrapper.findAll('.p-select-dropdown');
    expect(elements.length).toBe(7);
  });

  it('renders the correct amount of input components', async () => {
    const wrapper = mount(EnquiryForm, wrapperSettings());
    await nextTick();

    // includes datepicker and input mask components, but not dropdowns
    const elements = wrapper.findAll('.p-inputtext');
    expect(elements.length).toBe(6);
  });

  it('renders the correct amount of datepickers components', async () => {
    const wrapper = mount(EnquiryForm, wrapperSettings());
    await nextTick();

    const elements = wrapper.findAll('.p-datepicker-input');
    expect(elements.length).toBe(1);
  });

  it('renders the correct amount of input mask components (phone number)', async () => {
    const wrapper = mount(EnquiryForm, wrapperSettings());
    await nextTick();

    const elements = wrapper.findAll('.p-inputmask');
    expect(elements.length).toBe(1);
  });

  it('renders the correct amount of text area components', async () => {
    const wrapper = mount(EnquiryForm, wrapperSettings());
    await nextTick();

    const elements = wrapper.findAll('textarea');
    expect(elements.length).toBe(1);
  });
});
