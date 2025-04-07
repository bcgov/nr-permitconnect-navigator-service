import SubmissionsNavigator from '@/components/housing/submission/SubmissionsNavigator.vue';
import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { enquiryService, permitService, noteService, housingProjectService } from '@/services';
import { StorageKey, Resource } from '@/utils/enums/application';
import { mount } from '@vue/test-utils';
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

const getProjects = vi.spyOn(housingProjectService, 'getProjects');
const getEnquiries = vi.spyOn(enquiryService, 'getEnquiries');
const listPermits = vi.spyOn(permitService, 'listPermits');
const listBringForward = vi.spyOn(noteService, 'listBringForward');
const searchProjects = vi.spyOn(housingProjectService, 'searchProjects');
const getStatistics = vi.spyOn(housingProjectService, 'getStatistics');

getProjects.mockResolvedValue({ data: [{ activityId: 'someActivityid' }] } as AxiosResponse);
getEnquiries.mockResolvedValue({ data: [{ activityId: 'someActivityid' }] } as AxiosResponse);
listPermits.mockResolvedValue({ data: [{ activityId: 'someActivityid' }] } as AxiosResponse);
listBringForward.mockResolvedValue({ data: [{ activityId: 'someActivityid' }] } as AxiosResponse);
searchProjects.mockResolvedValue({ data: [{ activityId: 'someActivityid' }] } as AxiosResponse);
getStatistics.mockResolvedValue({ data: [{ activityId: 'someActivityid' }] } as AxiosResponse);

const wrapperSettings = () => ({
  props: {
    bringForward: [],
    enquiries: [],
    permits: [],
    projects: [],
    statistics: undefined
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

describe('SubmissionsNavigator.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with the provided props', () => {
    const wrapper = mount(SubmissionsNavigator, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });
});
