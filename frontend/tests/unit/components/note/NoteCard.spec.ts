import { createTestingPinia } from '@pinia/testing';
import { mount } from '@vue/test-utils';

import NoteCard from '@/components/note/NoteCard.vue';
import { userService } from '@/services';
import { StorageKey } from '@/utils/constants';
import { formatDateShort } from '@/utils/formatters';
import PrimeVue from 'primevue/config';

import type { AxiosResponse } from 'axios';

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

const testNote = {
  noteId: 'noteUUID',
  activityId: 'activityUUID',
  note: 'note contents text',
  noteType: 'Note Type',
  title: 'note contents title',
  createdBy: 'testCreatedBy',
  createdAt: currentDate,
  updatedBy: 'testUpdatedAt',
  updatedAt: currentDate
};

const wrapperSettings = (testNoteProp = testNote) => ({
  props: {
    note: testNoteProp
  },
  global: {
    plugins: [emptyTestPinia(), PrimeVue],
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
        plugins: [emptyTestPinia(), PrimeVue],
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

  it('displays p tags', async () => {
    const wrapper = mount(NoteCard, wrapperSettings());
    const pTag = wrapper.findAll('p');
    expect(pTag[0].text()).toBe(`Date: ${formatDateShort(currentDate)}`);
    expect(pTag[1].text()).toBe('Author:');
    expect(pTag[2].text()).toBe(`Note type: ${testNote.noteType}`);
    expect(pTag[3].text()).toBe(testNote.note);
  });
});
