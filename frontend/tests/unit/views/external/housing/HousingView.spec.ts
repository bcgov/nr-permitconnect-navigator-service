import PrimeVue from 'primevue/config';
import Tooltip from 'primevue/tooltip';
import { shallowMount } from '@vue/test-utils';

import { enquiryService, housingProjectService, permitService } from '@/services';
import HousingView from '@/views/external/housing/HousingView.vue';

import type { AxiosResponse } from 'axios';

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
    plugins: [() => PrimeVue],
    stubs: ['font-awesome-icon', 'router-link'],
    directives: {
      Tooltip: Tooltip
    }
  }
});

describe('HousingView.vue', () => {
  it('renders', () => {
    const wrapper = shallowMount(HousingView, wrapperSettings());

    expect(wrapper).toBeTruthy();
  });
});
