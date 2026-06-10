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

import type { BringForward, Enquiry, HousingProject, Permit, SearchPermitsResponse, ProjectStatistics } from '@/types';

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

const listProjects = vi.spyOn(housingProjectService, 'listProjects');
const listEnquiries = vi.spyOn(enquiryService, 'listEnquiries');
const listPermits = vi.spyOn(permitService, 'listPermits');
const listBringForward = vi.spyOn(noteHistoryService, 'listBringForwards');
const searchProjects = vi.spyOn(housingProjectService, 'searchProjects');
const getProjectStatistics = vi.spyOn(housingProjectService, 'getProjectStatistics');
const searchPermitsSpy = vi.spyOn(permitService, 'searchPermits');
const listPermitTypesSpy = vi.spyOn(permitService, 'listPermitTypes');
const listSourceSystemKindsSpy = vi.spyOn(sourceSystemKindService, 'listSourceSystemKinds');

listProjects.mockResolvedValue([{ activityId: 'someActivityid' }] as HousingProject[]);
listEnquiries.mockResolvedValue([{ activityId: 'someActivityid' }] as Enquiry[]);
listPermits.mockResolvedValue([{ activityId: 'someActivityid' }] as Permit[]);
listBringForward.mockResolvedValue([{ activityId: 'someActivityid' }] as BringForward[]);
searchProjects.mockResolvedValue([{ activityId: 'someActivityid' }] as HousingProject[]);
getProjectStatistics.mockResolvedValue({} as ProjectStatistics);
searchPermitsSpy.mockResolvedValue({ permits: [], totalRecords: 0 } as SearchPermitsResponse);
listPermitTypesSpy.mockResolvedValue([]);
listSourceSystemKindsSpy.mockResolvedValue([]);

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

describe.todo('SubmissionsNavigator.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with the provided props', () => {
    const wrapper = mount(SubmissionsNavigator, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });
});
