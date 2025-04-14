import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import { shallowMount } from '@vue/test-utils';

import { electrificationProjectService, enquiryService, noteService, permitService } from '@/services';
import ElectrificationView from '@/views/internal/electrification/ElectrificationView.vue';

import type { AxiosResponse } from 'axios';

vi.mock('vue-router', () => ({
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

const searchEnquiriesSpy = vi.spyOn(enquiryService, 'searchEnquiries');
const listPermitsSpy = vi.spyOn(permitService, 'listPermits');
const searchProjectsSpy = vi.spyOn(electrificationProjectService, 'searchProjects');
const getStatisticsSpy = vi.spyOn(electrificationProjectService, 'getStatistics');
const listBringForwardSpy = vi.spyOn(noteService, 'listBringForward');

searchEnquiriesSpy.mockResolvedValue({ data: [] } as AxiosResponse);
listPermitsSpy.mockResolvedValue({ data: [] } as AxiosResponse);
searchProjectsSpy.mockResolvedValue({ data: [] } as AxiosResponse);
getStatisticsSpy.mockResolvedValue({ data: [] } as AxiosResponse);
listBringForwardSpy.mockResolvedValue({ data: undefined } as AxiosResponse);

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
      PrimeVue
    ],
    stubs: ['font-awesome-icon', 'router-link']
  }
});

describe('ElectrificationView.vue', () => {
  it('renders', () => {
    const wrapper = shallowMount(ElectrificationView, wrapperSettings());

    expect(wrapper).toBeTruthy();
  });
});
