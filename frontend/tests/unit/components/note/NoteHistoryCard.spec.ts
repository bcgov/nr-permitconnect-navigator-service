import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { mount } from '@vue/test-utils';

import NoteHistoryCard from '@/components/note/NoteHistoryCard.vue';
import { userService } from '@/services';
import { StorageKey } from '@/utils/enums/application';
import { BringForwardType, NoteType } from '@/utils/enums/projectCommon';
import { formatDate, formatDateShort } from '@/utils/formatters';

import type { AxiosResponse } from 'axios';
import type { Note, NoteHistory } from '@/types';

const useUserService = vi.spyOn(userService, 'searchUsers');

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  })
}));

const emptyTestPinia = () =>
  createTestingPinia({
    initialState: {
      auth: {
        user: {}
      }
    }
  });

const currentDate = new Date().toISOString();
const tomorrowDate = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString();
const yesterdayDate = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString();

const TEST_NOTE: Note = {
  noteId: '123',
  noteHistoryId: '123',
  note: 'some text',
  createdBy: 'user',
  createdAt: new Date().toISOString(),
  updatedBy: 'user',
  updatedAt: new Date().toISOString()
};

const TEST_NOTE_HISTORY: NoteHistory = {
  activityId: '123',
  bringForwardDate: null,
  bringForwardState: null,
  escalateToDirector: false,
  escalateToSupervisor: false,
  isDeleted: false,
  note: [TEST_NOTE],
  noteHistoryId: '123',
  type: NoteType.GENERAL,
  title: 'Title',
  shownToProponent: false,
  createdBy: 'user',
  createdAt: new Date().toISOString(),
  updatedBy: 'user',
  updatedAt: new Date().toISOString()
};

const TEST_NOTE_HISTORY_UNRESOLVED: NoteHistory = {
  ...TEST_NOTE_HISTORY,
  bringForwardDate: tomorrowDate,
  bringForwardState: BringForwardType.UNRESOLVED
};

const TEST_NOTE_HISTORY_RESOLVED: NoteHistory = {
  ...TEST_NOTE_HISTORY,
  bringForwardDate: yesterdayDate,
  bringForwardState: BringForwardType.RESOLVED
};

const wrapperSettings = (testNoteHistoryProp = TEST_NOTE_HISTORY) => ({
  props: {
    noteHistory: testNoteHistoryProp
  },
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
      PrimeVue,
      ConfirmationService,
      ToastService
    ],
    stubs: ['font-awesome-icon']
  }
});

beforeEach(() => {
  sessionStorage.setItem(
    StorageKey.CONFIG,
    JSON.stringify({
      oidc: {
        authority: 'abc',
        clientId: '123'
      }
    })
  );

  vi.clearAllMocks();

  useUserService.mockResolvedValue({ data: [{ fullName: 'dummyName' }] } as AxiosResponse);
});

afterEach(() => {
  sessionStorage.clear();
});

describe('NoteHistoryCard', () => {
  it('renders component', async () => {
    const wrapper = mount(NoteHistoryCard, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });

  it('does not retrieve username when createdBy is empty', async () => {
    const alteredTestNote = {
      ...TEST_NOTE_HISTORY,
      createdBy: ''
    };
    const wrapper = mount(NoteHistoryCard, {
      props: {
        noteHistory: alteredTestNote
      },
      global: {
        plugins: [emptyTestPinia(), PrimeVue, ConfirmationService, ToastService],
        stubs: ['font-awesome-icon']
      }
    });
    expect(useUserService).not.toHaveBeenCalled();
    expect(wrapper.get('h3').text()).toBe(TEST_NOTE_HISTORY.title);
  });

  it('displays note title', async () => {
    const wrapper = mount(NoteHistoryCard, wrapperSettings());
    expect(wrapper.get('h3').text()).toBe(TEST_NOTE_HISTORY.title);
  });

  it('displays p tags for general notes', async () => {
    const wrapper = mount(NoteHistoryCard, wrapperSettings());
    const pTag = wrapper.findAll('p');

    expect(wrapper.find('[data-test="bf-title"]').exists()).toBe(false);
    expect(pTag.length).toBe(4);
    expect(pTag[0].text()).toBe(`Date: ${formatDateShort(currentDate)}`);
    expect(pTag[1].text()).toBe('Author:');
    expect(pTag[2].text()).toBe(`Note type: ${TEST_NOTE_HISTORY.type}`);
    expect(pTag[3].text()).toBe(TEST_NOTE_HISTORY.note[0].note);
  });

  it('displays p tags for unresolved notes', async () => {
    const wrapper = mount(NoteHistoryCard, wrapperSettings(TEST_NOTE_HISTORY_UNRESOLVED));
    const pTag = wrapper.findAll('p');

    expect(wrapper.find('[data-test="bf-title"]').text()).toBe(`(${TEST_NOTE_HISTORY_UNRESOLVED.bringForwardState})`);
    expect(pTag.length).toBe(5);
    expect(pTag[0].text()).toBe(`Date: ${formatDateShort(currentDate)}`);
    expect(pTag[1].text()).toBe('Author:');
    expect(pTag[2].text()).toBe(`Note type: ${TEST_NOTE_HISTORY_UNRESOLVED.type}`);
    expect(pTag[3].text()).toBe(`Bring forward date: ${formatDate(tomorrowDate)}`);
    expect(pTag[4].text()).toBe(TEST_NOTE_HISTORY_UNRESOLVED.note[0].note);
  });

  it('displays p tags for resolved notes', async () => {
    const wrapper = mount(NoteHistoryCard, wrapperSettings(TEST_NOTE_HISTORY_RESOLVED));
    const pTag = wrapper.findAll('p');

    expect(wrapper.find('[data-test="bf-title"]').text()).toBe(`(${TEST_NOTE_HISTORY_RESOLVED.bringForwardState})`);
    expect(pTag.length).toBe(5);
    expect(pTag[0].text()).toBe(`Date: ${formatDateShort(currentDate)}`);
    expect(pTag[1].text()).toBe('Author:');
    expect(pTag[2].text()).toBe(`Note type: ${TEST_NOTE_HISTORY_RESOLVED.type}`);
    expect(pTag[3].text()).toBe(`Bring forward date: ${formatDate(yesterdayDate)}`);
    expect(pTag[4].text()).toBe(TEST_NOTE_HISTORY_RESOLVED.note[0].note);
  });
});
