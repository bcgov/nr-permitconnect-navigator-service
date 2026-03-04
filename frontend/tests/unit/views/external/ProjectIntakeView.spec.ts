import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import { flushPromises, shallowMount } from '@vue/test-utils';

import { default as i18n } from '@/i18n';
import { default as ElectrificationProjectIntakeForm } from '@/components/electrification/project/ProjectIntakeForm.vue';
import { default as HousingProjectIntakeForm } from '@/components/housing/project/ProjectIntakeForm.vue';
import {
  documentService,
  electrificationProjectService,
  generalProjectService,
  housingProjectService,
  permitService
} from '@/services';
import ProjectIntakeView from '@/views/external/ProjectIntakeView.vue';

import { Initiative } from '@/utils/enums/application';
import { mockAxiosResponse } from '../../../helpers';
import type { ElectrificationProject, GeneralProject, HousingProject } from '@/types';

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
  useRoute: () => ({ query: {} })
}));

vi.mock('@/services/documentService', () => ({
  default: {
    listDocuments: vi.fn()
  }
}));

vi.mock('@/services/electrificationProjectService', () => ({
  default: {
    getProject: vi.fn()
  }
}));

vi.mock('@/services/generalProjectService', () => ({
  default: {
    getProject: vi.fn()
  }
}));

vi.mock('@/services/housingProjectService', () => ({
  default: {
    getProject: vi.fn()
  }
}));

vi.mock('@/services/permitService', () => ({
  default: {
    getPermitTypes: vi.fn(),
    listPermits: vi.fn()
  }
}));

const wrapperSettings = (initiative = Initiative.HOUSING) => ({
  props: {
    draftId: undefined,
    projectId: '123'
  },
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
    stubs: ['font-awesome-icon', 'router-link']
  }
});

// Tests
beforeEach(() => {
  vi.mocked(documentService.listDocuments).mockResolvedValue(mockAxiosResponse([]));
  vi.mocked(electrificationProjectService.getProject).mockResolvedValue(
    mockAxiosResponse<ElectrificationProject>({ activityId: '123' } as ElectrificationProject)
  );
  vi.mocked(generalProjectService.getProject).mockResolvedValue(
    mockAxiosResponse<GeneralProject>({ activityId: '123' } as GeneralProject)
  );
  vi.mocked(housingProjectService.getProject).mockResolvedValue(
    mockAxiosResponse<HousingProject>({ activityId: '123' } as HousingProject)
  );
  vi.mocked(permitService.getPermitTypes).mockResolvedValue(mockAxiosResponse([]));
  vi.mocked(permitService.listPermits).mockResolvedValue(mockAxiosResponse([]));
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('ProjectIntakeView.vue', () => {
  it('does not render while loading', async () => {
    const wrapper = shallowMount(ProjectIntakeView, wrapperSettings());
    expect(wrapper.findComponent(ElectrificationProjectIntakeForm).exists()).toBe(false);
    expect(wrapper.findComponent(HousingProjectIntakeForm).exists()).toBe(false);
  });

  it('catches API errors and calls toast', async () => {
    vi.mocked(permitService.getPermitTypes).mockRejectedValueOnce(new Error('BOOM'));

    shallowMount(ProjectIntakeView, wrapperSettings());
    await flushPromises();

    expect(toastErrorMock).toHaveBeenCalledWith('BOOM', undefined, undefined);
  });

  it('renders ELECTRIFICATION components after loading', async () => {
    const wrapper = shallowMount(ProjectIntakeView, wrapperSettings(Initiative.ELECTRIFICATION));
    await flushPromises();

    expect(wrapper.findComponent(ElectrificationProjectIntakeForm).exists()).toBe(true);
    expect(wrapper.findComponent(HousingProjectIntakeForm).exists()).toBe(false);
  });

  it('renders HOUSING components after loading', async () => {
    const wrapper = shallowMount(ProjectIntakeView, wrapperSettings());
    await flushPromises();

    expect(wrapper.findComponent(ElectrificationProjectIntakeForm).exists()).toBe(false);
    expect(wrapper.findComponent(HousingProjectIntakeForm).exists()).toBe(true);
  });
});
