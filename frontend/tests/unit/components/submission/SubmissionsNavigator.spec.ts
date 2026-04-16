import SubmissionsNavigator from '@/components/submission/SubmissionsNavigator.vue';
import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import {
  enquiryService,
  permitService,
  noteHistoryService,
  housingProjectService,
  sourceSystemKindService
} from '@/services';
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
const listBringForward = vi.spyOn(noteHistoryService, 'listBringForward');
const searchProjects = vi.spyOn(housingProjectService, 'searchProjects');
const getStatistics = vi.spyOn(housingProjectService, 'getStatistics');
const searchPermitsSpy = vi.spyOn(permitService, 'searchPermits');
const getPermitTypesSpy = vi.spyOn(permitService, 'getPermitTypes');
const getSourceSystemKindsSpy = vi.spyOn(sourceSystemKindService, 'getSourceSystemKinds');

getProjects.mockResolvedValue({ data: [{ activityId: 'someActivityid' }] } as AxiosResponse);
getEnquiries.mockResolvedValue({ data: [{ activityId: 'someActivityid' }] } as AxiosResponse);
listPermits.mockResolvedValue({ data: [{ activityId: 'someActivityid' }] } as AxiosResponse);
listBringForward.mockResolvedValue({ data: [{ activityId: 'someActivityid' }] } as AxiosResponse);
searchProjects.mockResolvedValue({ data: [{ activityId: 'someActivityid' }] } as AxiosResponse);
getStatistics.mockResolvedValue({ data: [{ activityId: 'someActivityid' }] } as AxiosResponse);
searchPermitsSpy.mockResolvedValue({ data: { permits: [], totalRecords: 0 } } as AxiosResponse);
getPermitTypesSpy.mockResolvedValue({ data: [] } as AxiosResponse);
getSourceSystemKindsSpy.mockResolvedValue({ data: [] } as AxiosResponse);

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
