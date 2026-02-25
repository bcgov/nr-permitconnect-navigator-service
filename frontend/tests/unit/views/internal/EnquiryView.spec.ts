import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import { nextTick } from 'vue';
import { flushPromises, shallowMount } from '@vue/test-utils';

import i18n from '@/i18n';
import EnquiryForm from '@/components/enquiry/EnquiryForm.vue';
import NoteHistoryCard from '@/components/note/NoteHistoryCard.vue';
import { enquiryService, noteHistoryService, userService } from '@/services';
import { useEnquiryStore } from '@/store';
import { Initiative } from '@/utils/enums/application';
import EnquiryView from '@/views/internal/EnquiryView.vue';
import { mockAxiosResponse, PRIMEVUE_STUBS, t } from '../../../helpers';

import type { NoteHistory } from '@/types';

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
  useRoute: vi.fn(() => ({
    query: {}
  })),
  useRouter: vi.fn(() => ({
    push: vi.fn()
  }))
}));

vi.mock('@/services/enquiryService', () => ({
  default: {
    getEnquiry: vi.fn()
  }
}));

vi.mock('@/services/noteHistoryService', () => ({
  default: {
    listNoteHistories: vi.fn()
  }
}));

vi.mock('@/services/userService', () => ({
  default: {
    searchUsers: vi.fn()
  }
}));

// Default component mounting wrapper settings
const wrapperSettings = (initiative = Initiative.HOUSING) => ({
  props: {
    enquiryId: '1'
  },
  global: {
    renderStubDefaultSlot: true,
    plugins: [
      createTestingPinia({
        initialState: {
          app: {
            initiative
          },
          enquiry: {
            enquiry: {
              enquiryId: '1'
            }
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
  vi.mocked(enquiryService.getEnquiry).mockResolvedValue(mockAxiosResponse({ activityId: '1', enquiryId: '1' }));
  vi.mocked(noteHistoryService.listNoteHistories).mockResolvedValue(
    mockAxiosResponse([{ noteHistoryId: '1', createdBy: '123' }])
  );
  vi.mocked(userService.searchUsers).mockResolvedValue(mockAxiosResponse([{ userId: '123', fullName: 'Fake User' }]));
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('EnquiryView.vue', () => {
  it('sets the correct header', () => {
    const wrapper = shallowMount(EnquiryView, wrapperSettings());
    expect(wrapper.html()).toContain(t('views.i.enquiryView.header'));
  });

  it('does not render while loading', async () => {
    const wrapper = shallowMount(EnquiryView, wrapperSettings());
    expect(wrapper.findComponent(EnquiryForm).exists()).toBe(false);
    expect(wrapper.findComponent(NoteHistoryCard).exists()).toBe(false);
  });

  it('throws error if unknown initiative', async () => {
    shallowMount(EnquiryView, wrapperSettings(Initiative.PCNS));
    await flushPromises();

    expect(toastErrorMock).toHaveBeenCalledWith(t('views.initiativeStateError'), undefined, undefined);
  });

  it('catches API errors and calls toast', async () => {
    vi.mocked(enquiryService.getEnquiry).mockRejectedValueOnce(new Error('BOOM'));

    shallowMount(EnquiryView, wrapperSettings());
    await flushPromises();

    expect(toastErrorMock).toHaveBeenCalledWith('BOOM', undefined, undefined);
  });

  it('renders EnquiryForm after loading', async () => {
    const wrapper = shallowMount(EnquiryView, wrapperSettings());
    await flushPromises();

    expect(wrapper.findComponent(EnquiryForm).exists()).toBe(true);
  });

  it('renders NoteHistoryCard after loading', async () => {
    const wrapper = shallowMount(EnquiryView, wrapperSettings());
    await flushPromises();

    expect(wrapper.findComponent(NoteHistoryCard).exists()).toBe(true);
  });

  it('renders correct number of NoteHistoryCards', async () => {
    const wrapper = shallowMount(EnquiryView, wrapperSettings());
    await flushPromises();

    const enquiryStore = useEnquiryStore();
    enquiryStore.setNoteHistory([{ noteHistoryId: '1' } as NoteHistory, { noteHistoryId: '2' } as NoteHistory]);
    await nextTick();

    const cards = wrapper.findAllComponents(NoteHistoryCard);
    expect(cards).toHaveLength(2);
  });
});
