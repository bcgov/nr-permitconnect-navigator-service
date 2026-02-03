import { nextTick } from 'vue';
import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { flushPromises, shallowMount } from '@vue/test-utils';

import { default as i18n } from '@/i18n';
import { default as ElectrificationProjectForm } from '@/components/electrification/project/ProjectFormNavigator.vue';
import { default as HousingProjectForm } from '@/components/housing/project/ProjectFormNavigator.vue';
import NoteHistoryCard from '@/components/note/NoteHistoryCard.vue';
import ProjectTeamTable from '@/components/projectCommon/ProjectTeamTable.vue';
import Roadmap from '@/components/roadmap/Roadmap.vue';
import {
  activityContactService,
  documentService,
  electrificationProjectService,
  enquiryService,
  housingProjectService,
  noteHistoryService,
  permitService
} from '@/services';
import { useAuthZStore, useProjectStore } from '@/store';
import { Action, GroupName, Initiative, Resource, RouteName } from '@/utils/enums/application';
import ProjectView from '@/views/internal/ProjectView.vue';
import { mockAxiosResponse, PRIMEVUE_STUBS, t } from '../../../helpers';

import type { ElectrificationProject, Group, HousingProject, NoteHistory } from '@/types';

// Mock functions we need to test
const pushMock = vi.fn();
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
  useRoute: vi.fn(() => ({
    query: {}
  })),
  useRouter: vi.fn(() => ({
    push: pushMock
  }))
}));

vi.mock('@/services/enquiryService', () => ({
  default: {
    listRelatedEnquiries: vi.fn()
  }
}));

vi.mock('@/services/permitService', () => ({
  default: {
    getPermitTypes: vi.fn(),
    listPermits: vi.fn()
  }
}));

vi.mock('@/services/electrificationProjectService', () => ({
  default: {
    getProject: vi.fn()
  }
}));

vi.mock('@/services/housingProjectService', () => ({
  default: {
    getProject: vi.fn()
  }
}));

vi.mock('@/services/noteHistoryService', () => ({
  default: {
    listNoteHistories: vi.fn()
  }
}));

vi.mock('@/services/activityContactService', () => ({
  default: {
    listActivityContacts: vi.fn()
  }
}));

vi.mock('@/services/documentService', () => ({
  default: {
    listDocuments: vi.fn()
  }
}));

// Default component mounting wrapper settings
const wrapperSettings = (initiative = Initiative.HOUSING) => ({
  props: {
    projectId: '123'
  },
  global: {
    plugins: [
      createTestingPinia({
        initialState: {
          app: {
            initiative
          }
        },
        stubActions: false
      }),
      i18n,
      PrimeVue,
      ConfirmationService,
      ToastService
    ],
    stubs: {
      'font-awesome-icon': true,
      'router-link': true,
      ...PRIMEVUE_STUBS
    }
  }
});

// Tests
beforeEach(() => {
  vi.mocked(electrificationProjectService.getProject).mockResolvedValue(
    mockAxiosResponse({ electrificationProjectId: '123', activityId: '123' })
  );
  vi.mocked(housingProjectService.getProject).mockResolvedValue(
    mockAxiosResponse({ housingProjectId: '123', activityId: '123' })
  );
  vi.mocked(activityContactService.listActivityContacts).mockResolvedValue(mockAxiosResponse([]));
  vi.mocked(documentService.listDocuments).mockResolvedValue(
    mockAxiosResponse([{ documentId: '123', filename: 'foo' }])
  );
  vi.mocked(noteHistoryService.listNoteHistories).mockResolvedValue(mockAxiosResponse([{ noteHistoryId: '123' }]));
  vi.mocked(permitService.listPermits).mockResolvedValue(mockAxiosResponse([{ permitId: '123' }]));
  vi.mocked(permitService.getPermitTypes).mockResolvedValue(mockAxiosResponse([{ permitTypeId: '123' }]));
  vi.mocked(enquiryService.listRelatedEnquiries).mockResolvedValue(mockAxiosResponse([{ enquiryId: '123' }]));
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('ProjectView.vue', () => {
  it('does not render while loading', async () => {
    const wrapper = shallowMount(ProjectView, wrapperSettings());
    expect(wrapper.findComponent(HousingProjectForm).exists()).toBe(false);
    expect(wrapper.findComponent(ElectrificationProjectForm).exists()).toBe(false);
    expect(wrapper.findComponent(NoteHistoryCard).exists()).toBe(false);
    expect(wrapper.findComponent(Roadmap).exists()).toBe(false);
  });

  it('throws error if unknown initiative', async () => {
    shallowMount(ProjectView, wrapperSettings(Initiative.PCNS));
    await flushPromises();

    expect(toastErrorMock).toHaveBeenCalledWith(t('views.initiativeStateError'), undefined, undefined);
  });

  it('catches API errors and calls toast', async () => {
    vi.mocked(housingProjectService.getProject).mockRejectedValueOnce(new Error('BOOM'));

    shallowMount(ProjectView, wrapperSettings());
    await flushPromises();

    expect(toastErrorMock).toHaveBeenCalledWith('BOOM', undefined, undefined);
  });

  it('renders common components after loading', async () => {
    const wrapper = shallowMount(ProjectView, wrapperSettings());
    await flushPromises();

    expect(wrapper.findComponent(NoteHistoryCard).exists()).toBe(true);
    expect(wrapper.findComponent(Roadmap).exists()).toBe(true);
  });

  it('renders ELECTRIFICATION components after loading', async () => {
    const wrapper = shallowMount(ProjectView, wrapperSettings(Initiative.ELECTRIFICATION));
    await flushPromises();

    const projectStore = useProjectStore();
    projectStore.setProject({ electrificationProjectId: '123' } as ElectrificationProject);
    await nextTick();

    expect(wrapper.findComponent(ElectrificationProjectForm).exists()).toBe(true);
    expect(wrapper.findComponent(HousingProjectForm).exists()).toBe(false);
  });

  it('renders HOUSING components after loading', async () => {
    const wrapper = shallowMount(ProjectView, wrapperSettings());
    await flushPromises();

    const projectStore = useProjectStore();
    projectStore.setProject({ housingProjectId: '123' } as HousingProject);
    await nextTick();

    expect(wrapper.findComponent(ElectrificationProjectForm).exists()).toBe(false);
    expect(wrapper.findComponent(HousingProjectForm).exists()).toBe(true);
  });

  it('renders correct number of NoteHistoryCards', async () => {
    const wrapper = shallowMount(ProjectView, wrapperSettings());
    await flushPromises();

    const projectStore = useProjectStore();
    projectStore.setNoteHistory([{ noteHistoryId: '1' } as NoteHistory, { noteHistoryId: '2' } as NoteHistory]);
    await nextTick();

    const cards = wrapper.findAllComponents(NoteHistoryCard);
    expect(cards).toHaveLength(2);
  });

  it('only renders ProjectTeamTable when project is in store', async () => {
    const wrapper = shallowMount(ProjectView, wrapperSettings());
    await flushPromises();

    expect(wrapper.findComponent(ProjectTeamTable).exists()).toBe(true);

    const projectStore = useProjectStore();
    projectStore.setProject(undefined);
    await nextTick();

    expect(wrapper.findComponent(ProjectTeamTable).exists()).toBe(false);
  });

  describe('Add authorization button', () => {
    it('renders', async () => {
      const wrapper = shallowMount(ProjectView, wrapperSettings());
      await flushPromises();

      const button = wrapper.get('[data-test-id="add-authorization-button"]');
      expect(button).toBeTruthy();
    });

    it('displays correct text', async () => {
      const wrapper = shallowMount(ProjectView, wrapperSettings());
      await flushPromises();

      const button = wrapper.get('[data-test-id="add-authorization-button"]');
      expect(button.text()).toContain(t('views.i.projectView.addAuthorization'));
    });

    it('does not fire click event if disabled', async () => {
      const wrapper = shallowMount(ProjectView, wrapperSettings());
      await flushPromises();

      const button = wrapper.get('[data-test-id="add-authorization-button"]');
      await button.trigger('click');

      expect(pushMock).toBeCalledTimes(0);
    });

    it('navigates to INT_HOUSING_PROJECT_ADD_AUTHORIZATION when clicked', async () => {
      const wrapper = shallowMount(ProjectView, wrapperSettings());
      await flushPromises();

      // Give perms to store to enable the button
      const authzStore = useAuthZStore();
      authzStore.setPermissions({
        groups: [
          {
            initiativeCode: 'HOUSING',
            name: GroupName.NAVIGATOR
          } as Group
        ],
        permissions: [
          {
            resource: Resource.PERMIT,
            action: Action.CREATE,
            initiative: Initiative.HOUSING,
            group: GroupName.NAVIGATOR
          }
        ]
      });

      await nextTick();

      const button = wrapper.get('[data-test-id="add-authorization-button"]');
      await button.trigger('click');

      expect(pushMock).toBeCalledTimes(1);
      expect(pushMock).toHaveBeenCalledWith({
        name: RouteName.INT_HOUSING_PROJECT_ADD_AUTHORIZATION,
        params: {
          projectId: '123'
        }
      });
    });
  });
});
