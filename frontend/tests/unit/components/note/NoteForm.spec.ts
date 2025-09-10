import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { shallowMount } from '@vue/test-utils';

import NoteForm from '@/components/note/NoteForm.vue';
import { userService } from '@/services';

import { StorageKey } from '@/utils/enums/application';
import { NoteType } from '@/utils/enums/projectCommon';

import type { AxiosResponse } from 'axios';
import type { Note, NoteHistory } from '@/types';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: vi.fn()
  })
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  })
}));

const searchUsersSpy = vi.spyOn(userService, 'searchUsers');

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
  escalationType: null,
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

const wrapperSettings = () => ({
  props: {
    noteHistory: TEST_NOTE_HISTORY
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
    stubs: {
      'font-awesome-icon': true
    }
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
});

afterEach(() => {
  sessionStorage.clear();
});

// Currently, modal functionality hidden behind Primevue component Dialog
describe('NoteForm', () => {
  it('renders', () => {
    searchUsersSpy.mockResolvedValue({ data: [{ fullName: 'dummyName' }] } as AxiosResponse);
    const wrapper = shallowMount(NoteForm, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });
});
