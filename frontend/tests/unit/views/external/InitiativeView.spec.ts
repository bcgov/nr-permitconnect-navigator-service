import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import Tooltip from 'primevue/tooltip';
import { flushPromises, shallowMount } from '@vue/test-utils';

import { default as i18n } from '@/i18n';
import { electrificationProjectService, enquiryService, housingProjectService, permitService } from '@/services';
import { Initiative } from '@/utils/enums/application';
import InitiativeView from '@/views/external/InitiativeView.vue';
import { mockAxiosResponse, PRIMEVUE_STUBS, t } from '../../../helpers';

// Mock functions we need to test
const toastErrorMock = vi.fn();

// Mock dependencies
vi.mock('primevue/usetoast', () => ({
  useToast: () => ({
    add: vi.fn(),
    remove: vi.fn(),
    removeAll: vi.fn()
  })
}));

vi.mock('@/lib/primevue/useToast', () => ({
  useToast: () => ({
    error: toastErrorMock
  })
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({
    query: {},
    params: {}
    //name: 'housing-route'
  }),
  useRouter: () => ({
    push: vi.fn()
  })
}));

vi.mock('@/services/enquiryService', () => ({
  default: {
    getEnquiries: vi.fn()
  }
}));

vi.mock('@/services/electrificationProjectService', () => ({
  default: {
    getDrafts: vi.fn(),
    searchProjects: vi.fn()
  }
}));

vi.mock('@/services/housingProjectService', () => ({
  default: {
    getDrafts: vi.fn(),
    searchProjects: vi.fn()
  }
}));

vi.mock('@/services/permitService', () => ({
  default: {
    listPermits: vi.fn()
  }
}));

// Default component mounting wrapper settings
const wrapperSettings = (initiative = Initiative.HOUSING) => ({
  global: {
    plugins: [
      createTestingPinia({
        initialState: {
          app: {
            initiative
          }
        }
      }),
      i18n,
      PrimeVue
    ],
    stubs: { 'font-awesome-icon': true, 'router-link': true, ...PRIMEVUE_STUBS },
    directives: {
      Tooltip: Tooltip
    }
  }
});

// Tests
beforeEach(() => {
  vi.mocked(enquiryService.getEnquiries).mockResolvedValue(mockAxiosResponse([]));
  vi.mocked(electrificationProjectService.getDrafts).mockResolvedValue(mockAxiosResponse([]));
  vi.mocked(electrificationProjectService.searchProjects).mockResolvedValue(mockAxiosResponse([]));
  vi.mocked(housingProjectService.getDrafts).mockResolvedValue(mockAxiosResponse([]));
  vi.mocked(housingProjectService.searchProjects).mockResolvedValue(mockAxiosResponse([]));
  vi.mocked(permitService.listPermits).mockResolvedValue(mockAxiosResponse([]));
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('InitiativeView.vue', () => {
  it('throws error if unknown initiative', async () => {
    shallowMount(InitiativeView, wrapperSettings(Initiative.PCNS));
    await flushPromises();

    expect(toastErrorMock).toHaveBeenCalledWith(t('views.initiativeStateError'), undefined, undefined);
  });

  it('catches API errors and calls toast', async () => {
    vi.mocked(enquiryService.getEnquiries).mockRejectedValueOnce(new Error('BOOM'));

    shallowMount(InitiativeView, wrapperSettings());
    await flushPromises();

    expect(toastErrorMock).toHaveBeenCalledWith('BOOM', undefined, undefined);
  });

  it.each([
    { initiative: Initiative.ELECTRIFICATION, text: t('views.e.initiativeView.electrification.header') },
    { initiative: Initiative.HOUSING, text: t('views.e.initiativeView.housing.header') }
  ])('sets the correct header for $initiative when loaded', async (value) => {
    const wrapper = shallowMount(InitiativeView, wrapperSettings(value.initiative));
    await flushPromises();

    const childComponent = wrapper.find('h1');
    expect(childComponent.text()).toBe(value.text);
  });
});
