import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { mount } from '@vue/test-utils';

import NoteCard from '@/components/note/NoteCard.vue';
import { userService } from '@/services';
import { StorageKey } from '@/utils/enums/application';
import { BringForwardType, NoteType } from '@/utils/enums/housing';
import { formatDate, formatDateShort } from '@/utils/formatters';

import type { AxiosResponse } from 'axios';
import type { Note } from '@/types';

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

const testNote: Note = {
  noteId: 'noteUUID',
  activityId: 'activityUUID',
  note: 'note contents text',
  noteType: NoteType.GENERAL,
  title: 'note contents title',
  createdBy: 'testCreatedBy',
  createdAt: currentDate,
  updatedBy: 'testUpdatedAt',
  updatedAt: currentDate,
  isDeleted: false
};

const testNoteUnresolved: Note = {
  noteId: 'noteUUID',
  activityId: 'activityUUID',
  bringForwardDate: tomorrowDate,
  bringForwardState: BringForwardType.UNRESOLVED,
  note: 'note contents text',
  noteType: NoteType.BRING_FORWARD,
  title: 'note contents title',
  createdBy: 'testCreatedBy',
  createdAt: currentDate,
  updatedBy: 'testUpdatedAt',
  updatedAt: currentDate,
  isDeleted: false
};

const testNoteResolved: Note = {
  noteId: 'noteUUID',
  activityId: 'activityUUID',
  bringForwardDate: yesterdayDate,
  bringForwardState: BringForwardType.RESOLVED,
  note: 'note contents text',
  noteType: NoteType.BRING_FORWARD,
  title: 'note contents title',
  createdBy: 'testCreatedBy',
  createdAt: currentDate,
  updatedBy: 'testUpdatedAt',
  updatedAt: currentDate,
  isDeleted: false
};

const wrapperSettings = (testNoteProp = testNote) => ({
  props: {
    note: testNoteProp
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

describe('noteCard test', () => {
  it('renders component', async () => {
    const wrapper = mount(NoteCard, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });

  it('does not retrieve username when createdBy is empty', async () => {
    const alteredTestNote = {
      ...testNote,
      createdBy: ''
    };
    const wrapper = mount(NoteCard, {
      props: {
        note: alteredTestNote
      },
      global: {
        plugins: [emptyTestPinia(), PrimeVue, ConfirmationService, ToastService],
        stubs: ['font-awesome-icon']
      }
    });
    expect(useUserService).not.toHaveBeenCalled();
    expect(wrapper.get('h3').text()).toBe(testNote.title);
  });

  it('displays note title', async () => {
    const wrapper = mount(NoteCard, wrapperSettings());
    expect(wrapper.get('h3').text()).toBe(testNote.title);
  });

  it('displays p tags for general notes', async () => {
    const wrapper = mount(NoteCard, wrapperSettings());
    const pTag = wrapper.findAll('p');

    expect(wrapper.find('[data-test="bf-title"]').exists()).toBe(false);
    expect(pTag.length).toBe(4);
    expect(pTag[0].text()).toBe(`Date: ${formatDateShort(currentDate)}`);
    expect(pTag[1].text()).toBe('Author:');
    expect(pTag[2].text()).toBe(`Note type: ${testNote.noteType}`);
    expect(pTag[3].text()).toBe(testNote.note);
  });

  it('displays p tags for unresolved notes', async () => {
    const wrapper = mount(NoteCard, wrapperSettings(testNoteUnresolved));
    const pTag = wrapper.findAll('p');

    expect(wrapper.find('[data-test="bf-title"]').text()).toBe(`(${testNoteUnresolved.bringForwardState})`);
    expect(pTag.length).toBe(5);
    expect(pTag[0].text()).toBe(`Date: ${formatDateShort(currentDate)}`);
    expect(pTag[1].text()).toBe('Author:');
    expect(pTag[2].text()).toBe(`Note type: ${testNoteUnresolved.noteType}`);
    expect(pTag[3].text()).toBe(`Bring forward date: ${formatDate(tomorrowDate)}`);
    expect(pTag[4].text()).toBe(testNoteUnresolved.note);
  });

  it('displays p tags for resolved notes', async () => {
    const wrapper = mount(NoteCard, wrapperSettings(testNoteResolved));
    const pTag = wrapper.findAll('p');

    expect(wrapper.find('[data-test="bf-title"]').text()).toBe(`(${testNoteResolved.bringForwardState})`);
    expect(pTag.length).toBe(5);
    expect(pTag[0].text()).toBe(`Date: ${formatDateShort(currentDate)}`);
    expect(pTag[1].text()).toBe('Author:');
    expect(pTag[2].text()).toBe(`Note type: ${testNoteResolved.noteType}`);
    expect(pTag[3].text()).toBe(`Bring forward date: ${formatDate(yesterdayDate)}`);
    expect(pTag[4].text()).toBe(testNoteResolved.note);
  });
});
