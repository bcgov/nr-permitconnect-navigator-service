import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import { nextTick } from 'vue';
import { flushPromises, shallowMount } from '@vue/test-utils';

import { default as i18n } from '@/i18n';
import ViewHeader from '@/components/common/ViewHeader.vue';
import SubmissionsNavigator from '@/components/submission/SubmissionsNavigator.vue';
import {
  electrificationProjectService,
  enquiryService,
  housingProjectService,
  noteHistoryService,
  permitService
} from '@/services';
import { useAuthZStore } from '@/store';
import { GroupName, Initiative } from '@/utils/enums/application';
import InitiativeView from '@/views/internal/InitiativeView.vue';
import { mockAxiosResponse } from '../../../helpers';

import type { Group } from '@/types';

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

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({
    replace: vi.fn()
  })
}));

vi.mock('@/lib/primevue/useToast', () => ({
  useToast: () => ({
    error: toastErrorMock
  })
}));

vi.mock('@/services/enquiryService', () => ({
  default: {
    searchEnquiries: vi.fn()
  }
}));

vi.mock('@/services/permitService', () => ({
  default: {
    listPermits: vi.fn()
  }
}));

vi.mock('@/services/electrificationProjectService', () => ({
  default: {
    searchProjects: vi.fn(),
    getStatistics: vi.fn()
  }
}));

vi.mock('@/services/housingProjectService', () => ({
  default: {
    searchProjects: vi.fn(),
    getStatistics: vi.fn()
  }
}));

vi.mock('@/services/noteHistoryService', () => ({
  default: {
    listBringForward: vi.fn()
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
          },
          authz: {
            groups: [{ initiativeCode: 'HOUSING', name: GroupName.NAVIGATOR }],
            permissions: []
          }
        },
        stubActions: false
      }),
      i18n,
      PrimeVue
    ],
    stubs: {
      // Force PrimeVue stubs to render children
      Tabs: { template: '<div><slot /></div>' },
      TabList: { template: '<div><slot /></div>' },
      Tab: { template: '<div><slot /></div>' },
      TabPanels: { template: '<div><slot /></div>' },
      TabPanel: { template: '<div><slot /></div>' }
    }
  }
});

beforeEach(() => {
  vi.mocked(enquiryService.searchEnquiries).mockResolvedValue(mockAxiosResponse([]));
  vi.mocked(permitService.listPermits).mockResolvedValue(mockAxiosResponse([]));
  vi.mocked(electrificationProjectService.searchProjects).mockResolvedValue(mockAxiosResponse([]));
  vi.mocked(electrificationProjectService.getStatistics).mockResolvedValue(mockAxiosResponse([]));
  vi.mocked(housingProjectService.searchProjects).mockResolvedValue(mockAxiosResponse([]));
  vi.mocked(housingProjectService.getStatistics).mockResolvedValue(mockAxiosResponse([]));
  vi.mocked(noteHistoryService.listBringForward).mockResolvedValue(mockAxiosResponse([]));
});

afterEach(() => {
  vi.clearAllMocks();
});

// Tests
describe('InitiativeView.vue', () => {
  it('does not render while loading', async () => {
    const wrapper = shallowMount(InitiativeView, wrapperSettings());
    expect(wrapper.findComponent(ViewHeader).exists()).toBe(false);
    expect(wrapper.findComponent(SubmissionsNavigator).exists()).toBe(false);
  });

  it('throws error if unknown initiative', async () => {
    shallowMount(InitiativeView, wrapperSettings(Initiative.PCNS));
    await flushPromises();

    expect(toastErrorMock).toHaveBeenCalledWith('Unable to determine initiative state', undefined, undefined);
  });

  it('catches API errors and calls toast', async () => {
    vi.mocked(enquiryService.searchEnquiries).mockRejectedValueOnce(new Error('BOOM'));

    shallowMount(InitiativeView, wrapperSettings());
    await flushPromises();

    expect(toastErrorMock).toHaveBeenCalledWith('BOOM', undefined, undefined);
  });

  it.each([
    { initiative: Initiative.ELECTRIFICATION, text: 'Electrification' },
    { initiative: Initiative.HOUSING, text: 'Housing' }
  ])('sets the correct header for $initiative when loaded', async (value) => {
    const wrapper = shallowMount(InitiativeView, wrapperSettings(value.initiative));
    await flushPromises();

    const childComponent = wrapper.findComponent(ViewHeader);
    expect(childComponent.props('header')).toBe(value.text);
  });

  it('renders SubmissionsNavigator after loading', async () => {
    const wrapper = shallowMount(InitiativeView, wrapperSettings());
    await flushPromises();

    expect(wrapper.findComponent(SubmissionsNavigator).exists()).toBe(true);
  });

  it('passes props to SubmissionsNavigator', async () => {
    const wrapper = shallowMount(InitiativeView, wrapperSettings());
    await flushPromises();

    const childComponent = wrapper.findComponent(SubmissionsNavigator);
    expect(childComponent.props('bringForward')).toStrictEqual([]);
    expect(childComponent.props('enquiries')).toStrictEqual([]);
    expect(childComponent.props('permits')).toStrictEqual([]);
    expect(childComponent.props('projects')).toStrictEqual([]);
    expect(childComponent.props('statistics')).toStrictEqual([]);
  });

  it('does not render SubmissionsNavigator without permission', async () => {
    const wrapper = shallowMount(InitiativeView, wrapperSettings());
    await flushPromises();

    const authzStore = useAuthZStore();
    authzStore.setPermissions({
      groups: [
        {
          initiativeCode: 'HOUSING',
          name: GroupName.PROPONENT
        } as Group
      ],
      permissions: []
    });

    await nextTick();

    expect(wrapper.findComponent(SubmissionsNavigator).exists()).toBe(false);
  });
});
