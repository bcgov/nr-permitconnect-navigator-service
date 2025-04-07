import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import { shallowMount } from '@vue/test-utils';

import { enquiryService, housingProjectService, noteService, permitService } from '@/services';
import HousingView from '@/views/internal/housing/HousingView.vue';

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

const getEnquiriesSpy = vi.spyOn(enquiryService, 'getEnquiries');
const listPermitsSpy = vi.spyOn(permitService, 'listPermits');
const searchProjectsSpy = vi.spyOn(housingProjectService, 'searchProjects');
const getStatisticsSpy = vi.spyOn(housingProjectService, 'getStatistics');
const listBringForwardSpy = vi.spyOn(noteService, 'listBringForward');

getEnquiriesSpy.mockResolvedValue({ data: [] } as AxiosResponse);
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

describe('HousingView.vue', () => {
  it('renders', () => {
    const wrapper = shallowMount(HousingView, wrapperSettings());

    expect(wrapper).toBeTruthy();
  });
});
