import ProjectView from '@/views/housing/project/ProjectView.vue';
import { contactService, permitService, submissionService } from '@/services';
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

const useContactService = vi.spyOn(contactService, 'searchContacts');
const getPermitTypesService = vi.spyOn(permitService, 'getPermitTypes');
const useSubmissionService = vi.spyOn(submissionService, 'searchSubmissions');

const testSubmissionId = 'submission123';
const exampleContact = {
  contactId: 'contact123',
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '123-456-7890'
};

useSubmissionService.mockResolvedValue({
  data: [{ activityId: 'activity456' }]
} as AxiosResponse);

useContactService.mockResolvedValue({
  data: [exampleContact]
} as AxiosResponse);

getPermitTypesService.mockResolvedValue({
  data: [{ permitTypeCode: 'test' }]
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
