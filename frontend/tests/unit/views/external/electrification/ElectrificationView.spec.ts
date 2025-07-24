import PrimeVue from 'primevue/config';
import Tooltip from 'primevue/tooltip';
import { shallowMount } from '@vue/test-utils';

import { electrificationProjectService, permitService } from '@/services';
import ElectrificationView from '@/views/external/electrification/ElectrificationView.vue';

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
    name: 'electrification-route'
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

const getDraftsSpy = vi.spyOn(electrificationProjectService, 'getDrafts');
const searchProjectsSpy = vi.spyOn(electrificationProjectService, 'searchProjects');
const listPermitsSpy = vi.spyOn(permitService, 'listPermits');

getDraftsSpy.mockResolvedValue({ data: [{ activityId: 'someActivityid' }] } as AxiosResponse);
searchProjectsSpy.mockResolvedValue({ data: [{ activityId: 'someActivityid' }] } as AxiosResponse);
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

describe('ElectrificationView.vue', () => {
  it('renders', () => {
    const wrapper = shallowMount(ElectrificationView, wrapperSettings());

    expect(wrapper).toBeTruthy();
  });
});
