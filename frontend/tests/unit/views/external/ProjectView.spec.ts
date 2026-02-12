import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import { Initiative, RouteName } from '@/utils/enums/application';
import { flushPromises, RouterLinkStub, shallowMount } from '@vue/test-utils';

import { default as i18n } from '@/i18n';
import BasicProjectInfoCard from '@/components/projectCommon/BasicProjectInfoCard.vue';
import NoteBanner from '@/components/note/NoteBanner.vue';
import RequiredAuths from '@/components/authorization/RequiredAuths.vue';
import RelatedEnquiryListProponent from '@/components/enquiry/RelatedEnquiryListProponent.vue';
import { PermitNeeded, PermitStage } from '@/utils/enums/permit';
import {
  activityContactService,
  contactService,
  enquiryService,
  permitService,
  housingProjectService,
  electrificationProjectService,
  noteHistoryService
} from '@/services';
import ProjectView from '@/views/external/ProjectView.vue';
import { mockAxiosResponse, PRIMEVUE_STUBS, t } from '../../../helpers';

// Mock functions we need to test
const routerReplace = vi.fn();
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
    push: vi.fn(),
    replace: routerReplace
  }))
}));

vi.mock('@/services/activityContactService', () => ({
  default: {
    listActivityContacts: vi.fn()
  }
}));

vi.mock('@/services/contactService', () => ({
  default: {
    searchContacts: vi.fn()
  }
}));

vi.mock('@/services/enquiryService', () => ({
  default: {
    listRelatedEnquiries: vi.fn()
  }
}));

vi.mock('@/services/permitService', () => ({
  default: {
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
      RouterLink: RouterLinkStub,
      ...PRIMEVUE_STUBS
    }
  }
});

// Tests
beforeEach(() => {
  vi.mocked(activityContactService.listActivityContacts).mockResolvedValue(mockAxiosResponse([]));
  vi.mocked(contactService.searchContacts).mockResolvedValue(mockAxiosResponse([]));
  vi.mocked(enquiryService.listRelatedEnquiries).mockResolvedValue(mockAxiosResponse([]));
  vi.mocked(permitService.listPermits).mockResolvedValue(
    mockAxiosResponse([{ needed: PermitNeeded.YES, stage: PermitStage.PRE_SUBMISSION }])
  );
  vi.mocked(electrificationProjectService.getProject).mockResolvedValue(
    mockAxiosResponse({ electrificationProjectId: '123', activityId: '123' })
  );
  vi.mocked(housingProjectService.getProject).mockResolvedValue(
    mockAxiosResponse({ housingProjectId: '123', activityId: '123' })
  );
  vi.mocked(noteHistoryService.listNoteHistories).mockResolvedValue(
    mockAxiosResponse([{ noteHistoryId: '123', shownToProponent: true, note: [{}] }])
  );
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('ProjectView.vue', () => {
  it('does not render while loading', async () => {
    const wrapper = shallowMount(ProjectView, wrapperSettings());
    expect(wrapper.findComponent(BasicProjectInfoCard).exists()).toBe(false);
    expect(wrapper.findComponent(NoteBanner).exists()).toBe(false);
    expect(wrapper.findComponent(RequiredAuths).exists()).toBe(false);
    expect(wrapper.findComponent(RelatedEnquiryListProponent).exists()).toBe(false);
  });

  it('throws error if unknown initiative', async () => {
    shallowMount(ProjectView, wrapperSettings(Initiative.PCNS));
    await flushPromises();

    expect(toastErrorMock).toHaveBeenCalledWith(t('views.initiativeStateError'), undefined, undefined);
  });

  it.each([
    {
      initiative: Initiative.ELECTRIFICATION,
      service: electrificationProjectService,
      initiativeRouteName: RouteName.EXT_ELECTRIFICATION
    },
    { initiative: Initiative.HOUSING, service: housingProjectService, initiativeRouteName: RouteName.EXT_HOUSING }
  ])('reroutes to correct route if project fails to load', async (value) => {
    vi.mocked(value.service.getProject).mockRejectedValueOnce(new Error('BOOM'));

    shallowMount(ProjectView, wrapperSettings(value.initiative));
    await flushPromises();

    expect(toastErrorMock).toHaveBeenCalledWith(t('views.e.projectView.toastProjectLoadFailed'));
    expect(routerReplace).toHaveBeenCalledWith({ name: value.initiativeRouteName });
  });

  it('catches API errors and calls toast', async () => {
    vi.mocked(permitService.listPermits).mockRejectedValueOnce(new Error('BOOM'));

    shallowMount(ProjectView, wrapperSettings());
    await flushPromises();

    expect(toastErrorMock).toHaveBeenCalledWith(t('views.e.projectView.toastPermitLoadFailed'), undefined, undefined);
  });

  it('renders components after loading', async () => {
    const wrapper = shallowMount(ProjectView, wrapperSettings());
    await flushPromises();

    expect(wrapper.findComponent(BasicProjectInfoCard).exists()).toBe(true);
    expect(wrapper.findComponent(NoteBanner).exists()).toBe(true);
    expect(wrapper.findComponent(RequiredAuths).exists()).toBe(true);
    expect(wrapper.findComponent(RelatedEnquiryListProponent).exists()).toBe(true);
  });
});
