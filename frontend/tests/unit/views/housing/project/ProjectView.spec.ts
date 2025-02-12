import ProjectView from '@/views/housing/project/ProjectView.vue';
import { contactService, enquiryService, permitService, submissionService } from '@/services';
import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { StorageKey } from '@/utils/enums/application';
import { shallowMount } from '@vue/test-utils';
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
    push: vi.fn(),
    replace: vi.fn()
  }))
}));

beforeEach(() => {
  sessionStorage.setItem(
    StorageKey.CONFIG,
    JSON.stringify({
      oidc: {
        authority: 'abc',
        clientId: '123'
      }
    })
  );

  vi.clearAllMocks();
});

afterEach(() => {
  sessionStorage.clear();
});

const listRelatedEnquiriesSpy = vi.spyOn(enquiryService, 'listRelatedEnquiries');
const listPermitsSpy = vi.spyOn(permitService, 'listPermits');
const getPermitTypesSpy = vi.spyOn(permitService, 'getPermitTypes');
const getSubmissionSpy = vi.spyOn(submissionService, 'getSubmission');
const searchContactSpy = vi.spyOn(contactService, 'searchContacts');
const searchSubmissionsSpy = vi.spyOn(submissionService, 'searchSubmissions');

const testSubmissionId = 'submission123';
const exampleContact = {
  contactId: 'contact123',
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '123-456-7890'
};

listRelatedEnquiriesSpy.mockResolvedValue({
  data: 'notTested'
} as AxiosResponse);

listPermitsSpy.mockResolvedValue({
  data: 'notTested'
} as AxiosResponse);

getPermitTypesSpy.mockResolvedValue({
  data: 'notTested'
} as AxiosResponse);

getSubmissionSpy.mockResolvedValue({
  data: 'notTested'
} as AxiosResponse);

searchContactSpy.mockResolvedValue({
  data: [exampleContact]
} as AxiosResponse);

searchSubmissionsSpy.mockResolvedValue({
  data: [{ activityId: 'activity456' }]
} as AxiosResponse);

const wrapperSettings = (testSubmissionIdProp = testSubmissionId) => ({
  props: {
    submissionId: testSubmissionIdProp
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

describe('ProjectView.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with the provided props', () => {
    const wrapper = shallowMount(ProjectView, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });
});
