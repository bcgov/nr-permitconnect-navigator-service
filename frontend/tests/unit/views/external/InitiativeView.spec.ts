import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import Tooltip from 'primevue/tooltip';
import { shallowMount } from '@vue/test-utils';

import { enquiryService, housingProjectService, permitService } from '@/services';
import InitiativeView from '@/views/external/InitiativeView.vue';

import type { AxiosResponse } from 'axios';
import { createTestingPinia } from '@pinia/testing';

// Mock dependencies
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: vi.fn()
  })
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({
    query: {},
    params: {},
    name: 'housing-route'
  }),
  useRouter: () => ({
    push: vi.fn()
  })
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  sessionStorage.clear();
});

const getEnquiriesSpy = vi.spyOn(enquiryService, 'getEnquiries');
const getDraftsSpy = vi.spyOn(housingProjectService, 'getDrafts');
const searchProjectsSpy = vi.spyOn(housingProjectService, 'searchProjects');
const listPermitsSpy = vi.spyOn(permitService, 'listPermits');

searchProjectsSpy.mockResolvedValue({ data: [{ activityId: 'someActivityid' }] } as AxiosResponse);
getEnquiriesSpy.mockResolvedValue({ data: [{ activityId: 'someActivityid' }] } as AxiosResponse);
getDraftsSpy.mockResolvedValue({ data: [{ activityId: 'someActivityid' }] } as AxiosResponse);
listPermitsSpy.mockResolvedValue({
  data: [
    { permitId: 'somePermitId', activityId: 'someActivityid', permitTypeId: 1, permitType: { name: 'Test Permit' } }
  ]
} as AxiosResponse);

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
      ToastService
    ],
    stubs: ['font-awesome-icon', 'router-link'],
    directives: {
      Tooltip: Tooltip
    }
  }
});

describe('InitiativeView.vue', () => {
  it('renders', () => {
    const wrapper = shallowMount(InitiativeView, wrapperSettings());

    expect(wrapper).toBeTruthy();
  });
});
