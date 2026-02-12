import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import { flushPromises, shallowMount } from '@vue/test-utils';

import { default as i18n } from '@/i18n';
import NoteForm from '@/components/note/NoteForm.vue';
import { electrificationProjectService, enquiryService, housingProjectService, noteHistoryService } from '@/services';
import { Initiative } from '@/utils/enums/application';
import NoteView from '@/views/internal/NoteView.vue';
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
  useRouter: () => ({
    push: vi.fn()
  })
}));

vi.mock('@/services/enquiryService', () => ({
  default: {
    getEnquiry: vi.fn()
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
const wrapperSettings = (
  enquiryId: string | undefined = undefined,
  projectId: string | undefined = undefined,
  noteHistoryId: string | undefined = undefined,
  initiative = Initiative.HOUSING
) => ({
  props: {
    enquiryId,
    projectId,
    noteHistoryId
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
      ...PRIMEVUE_STUBS
    }
  }
});

// Tests
beforeEach(() => {
  vi.mocked(enquiryService.getEnquiry).mockResolvedValue(mockAxiosResponse({ activityId: '1', enquiryId: '1' }));
  vi.mocked(noteHistoryService.listNoteHistories).mockResolvedValue(
    mockAxiosResponse([{ noteHistoryId: '1', createdBy: '123' }])
  );
  vi.mocked(electrificationProjectService.getProject).mockResolvedValue(
    mockAxiosResponse({ activityId: '2', electrificationProjectId: '2' })
  );
  vi.mocked(housingProjectService.getProject).mockResolvedValue(
    mockAxiosResponse({ activityId: '3', housingProjectId: '3' })
  );
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('NoteView.vue', () => {
  it('does not render while loading', async () => {
    const wrapper = shallowMount(NoteView, wrapperSettings());
    expect(wrapper.findComponent(NoteForm).exists()).toBe(false);
  });

  it('throws error if too many props', async () => {
    const wrapper = shallowMount(NoteView, wrapperSettings('1', '2', undefined, Initiative.HOUSING));
    await flushPromises();

    expect(toastErrorMock).toHaveBeenCalledWith(
      t('views.i.noteView.noteLoadError'),
      t('views.i.noteView.tooManyProps'),
      undefined
    );

    const childComponent = wrapper.findAllComponents(NoteForm);
    expect(childComponent).toHaveLength(0);
  });

  it('throws error if unknown initiative', async () => {
    shallowMount(NoteView, wrapperSettings(undefined, undefined, undefined, Initiative.PCNS));
    await flushPromises();

    expect(toastErrorMock).toHaveBeenCalledWith(
      t('views.i.noteView.noteLoadError'),
      t('views.initiativeStateError'),
      undefined
    );
  });

  it('catches API errors and calls toast', async () => {
    vi.mocked(enquiryService.getEnquiry).mockRejectedValueOnce(new Error('BOOM'));

    shallowMount(NoteView, wrapperSettings('1', undefined, undefined, Initiative.HOUSING));
    await flushPromises();

    expect(toastErrorMock).toHaveBeenCalledWith(t('views.i.noteView.noteLoadError'), 'BOOM', undefined);
  });

  it('does not render NoteForm without prop', async () => {
    const wrapper = shallowMount(NoteView, wrapperSettings());
    await flushPromises();

    expect(wrapper.findComponent(NoteForm).exists()).toBe(false);
  });

  it('renders NoteForm after loading', async () => {
    const wrapper = shallowMount(NoteView, wrapperSettings('1', undefined, undefined, Initiative.HOUSING));
    await flushPromises();

    const childComponent = wrapper.findAllComponents(NoteForm);
    expect(childComponent).toHaveLength(1);
  });
});
