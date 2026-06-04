import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import { flushPromises, shallowMount } from '@vue/test-utils';

import i18n from '@/i18n';
import ElectrificationProjectForm from '@/components/electrification/project/ProjectFormNavigator.vue';
import HousingProjectForm from '@/components/housing/project/ProjectFormNavigator.vue';
import NoteHistoryCard from '@/components/note/NoteHistoryCard.vue';
import ProjectTeamTab from '@/components/projectCommon/ProjectTeamTab.vue';
import ProjectRoadmapTab from '@/components/projectCommon/ProjectRoadmapTab.vue';
import {
  activityContactService,
  documentService,
  electrificationProjectService,
  enquiryService,
  generalProjectService,
  housingProjectService,
  noteHistoryService,
  permitService,
  roadmapService
} from '@/services';
import { Initiative, StorageKey } from '@/utils/enums/application';
import ProjectView from '@/views/internal/ProjectView.vue';
import { PRIMEVUE_STUBS, t } from '../../../helpers';

import type {
  ElectrificationProject,
  HousingProject,
  GeneralProject,
  Document,
  NoteHistory,
  Enquiry,
  Permit,
  PermitType
} from '@/types';
import ProjectInformationTab from '@/components/projectCommon/ProjectInformationTab.vue';
import ProjectFilesTab from '@/components/projectCommon/ProjectFilesTab.vue';
import ProjectAuthorizationsTab from '@/components/projectCommon/ProjectAuthorizationsTab.vue';
import ProjectNotesTab from '@/components/projectCommon/ProjectNotesTab.vue';
import ProjectEnquiryTab from '@/components/projectCommon/ProjectEnquiryTab.vue';

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
  enquiryService: {
    listRelatedEnquiries: vi.fn()
  }
}));

vi.mock('@/services/permitService', () => ({
  permitService: {
    listPermitTypes: vi.fn(),
    listPermits: vi.fn()
  }
}));

vi.mock('@/services/electrificationProjectService', () => ({
  electrificationProjectService: {
    getProject: vi.fn()
  }
}));

vi.mock('@/services/generalProjectService', () => ({
  generalProjectService: {
    getProject: vi.fn()
  }
}));

vi.mock('@/services/housingProjectService', () => ({
  housingProjectService: {
    getProject: vi.fn()
  }
}));

vi.mock('@/services/noteHistoryService', () => ({
  noteHistoryService: {
    listNoteHistories: vi.fn()
  }
}));

vi.mock('@/services/activityContactService', () => ({
  activityContactService: {
    listActivityContacts: vi.fn()
  }
}));

vi.mock('@/services/documentService', () => ({
  documentService: {
    listDocuments: vi.fn()
  }
}));

vi.mock('@/services/roadmapService', () => ({
  roadmapService: {
    getRoadmapNote: vi.fn()
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
      PrimeVue
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
  sessionStorage.setItem(
    StorageKey.CONFIG,
    JSON.stringify({
      oidc: {
        authority: 'http://localhost',
        clientId: 'test-client'
      }
    })
  );

  vi.mocked(electrificationProjectService.getProject).mockResolvedValue({
    electrificationProjectId: '123',
    activityId: '123'
  } as ElectrificationProject);
  vi.mocked(generalProjectService.getProject).mockResolvedValue({
    generalProjectId: '123',
    activityId: '123'
  } as GeneralProject);
  vi.mocked(housingProjectService.getProject).mockResolvedValue({
    housingProjectId: '123',
    activityId: '123'
  } as HousingProject);
  vi.mocked(activityContactService.listActivityContacts).mockResolvedValue([]);
  vi.mocked(documentService.listDocuments).mockResolvedValue([{ documentId: '123', filename: 'foo' } as Document]);
  vi.mocked(noteHistoryService.listNoteHistories).mockResolvedValue([{ noteHistoryId: '123' }] as NoteHistory[]);
  vi.mocked(permitService.listPermits).mockResolvedValue([{ permitId: '123' }] as Permit[]);
  vi.mocked(permitService.listPermitTypes).mockResolvedValue([{ permitTypeId: 123 }] as PermitType[]);
  vi.mocked(enquiryService.listRelatedEnquiries).mockResolvedValue([{ enquiryId: '123' }] as Enquiry[]);
  vi.mocked(roadmapService.getRoadmapNote).mockResolvedValue('some note text');
});

afterEach(() => {
  sessionStorage.clear();
  vi.clearAllMocks();
});

describe('ProjectView.vue', () => {
  it('does not render while loading', async () => {
    const wrapper = shallowMount(ProjectView, wrapperSettings());
    expect(wrapper.findComponent(HousingProjectForm).exists()).toBe(false);
    expect(wrapper.findComponent(ElectrificationProjectForm).exists()).toBe(false);
    expect(wrapper.findComponent(NoteHistoryCard).exists()).toBe(false);
    expect(wrapper.findComponent(ProjectRoadmapTab).exists()).toBe(false);
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

  it('renders tabs', async () => {
    const wrapper = shallowMount(ProjectView, wrapperSettings());
    await flushPromises();

    expect(wrapper.findComponent(ProjectInformationTab).exists()).toBe(true);
    expect(wrapper.findComponent(ProjectFilesTab).exists()).toBe(true);
    expect(wrapper.findComponent(ProjectAuthorizationsTab).exists()).toBe(true);
    expect(wrapper.findComponent(ProjectNotesTab).exists()).toBe(true);
    expect(wrapper.findComponent(ProjectRoadmapTab).exists()).toBe(true);
    expect(wrapper.findComponent(ProjectEnquiryTab).exists()).toBe(true);
    expect(wrapper.findComponent(ProjectTeamTab).exists()).toBe(true);
  });
});
