import { createTestingPinia } from '@pinia/testing';
import { shallowMount } from '@vue/test-utils';

import NoteCard from '@/components/note/NoteCard.vue';
import { userService } from '@/services';
import { StorageKey } from '@/utils/constants';
import PrimeVue from 'primevue/config';

import type { AxiosResponse } from 'axios';

const useUserService = vi.spyOn(userService, 'searchUsers');

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  })
}));

const emptyTestPinia = () => {
  return createTestingPinia({
    initialState: {
      auth: {
        user: {}
      }
    }
  });
};
const testNote = {
  noteId: 'noteUUID',
  activityId: 'activityUUID',
  note: 'note contents text',
  noteType: 'Note Type',
  title: 'note contents title',
  createdBy: 'testCreatedBy',
  createdAt: new Date().toISOString(),
  updatedBy: 'testUpdatedAt',
  updatedAt: new Date().toISOString()
};

const wrapperSettings = (testNoteProp = testNote) => {
  return {
    props: {
      note: testNoteProp
    },
    global: {
      plugins: [emptyTestPinia(), PrimeVue],
      stubs: ['font-awesome-icon']
    }
  };
};

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
  it('render component', async () => {
    const wrapper = shallowMount(NoteCard, wrapperSettings());

    expect(wrapper).toBeTruthy();
  });
});
