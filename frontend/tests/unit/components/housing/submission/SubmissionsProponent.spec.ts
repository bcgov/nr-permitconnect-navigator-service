import SubmissionsProponent from '@/components/housing/submission/SubmissionsProponent.vue';
import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { enquiryService, submissionService } from '@/services';
import { StorageKey, Resource } from '@/utils/enums/application';
import { mount } from '@vue/test-utils';
import type { AxiosResponse } from 'axios';

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

const getSubmissions = vi.spyOn(submissionService, 'getSubmissions');
const getEnquiries = vi.spyOn(enquiryService, 'getEnquiries');
const getDrafts = vi.spyOn(submissionService, 'getDrafts');

getSubmissions.mockResolvedValue({ data: [{ activityId: 'someActivityid' }] } as AxiosResponse);
getEnquiries.mockResolvedValue({ data: [{ activityId: 'someActivityid' }] } as AxiosResponse);
getDrafts.mockResolvedValue({ data: [{ activityId: 'someActivityid' }] } as AxiosResponse);

const wrapperSettings = () => ({
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
const testuser = { name: 'foo' };
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
  sessionStorage.setItem(Resource.USER, JSON.stringify(testuser));

  vi.clearAllMocks();
});

afterEach(() => {
  sessionStorage.clear();
});

describe('SubmissionsProponent.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with the provided props', () => {
    const wrapper = mount(SubmissionsProponent, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });
});
