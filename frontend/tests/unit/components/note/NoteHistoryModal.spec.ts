import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { shallowMount } from '@vue/test-utils';

import NoteHistoryModal from '@/components/note/NoteHistoryModal.vue';

import { StorageKey } from '@/utils/enums/application';
import { NoteType } from '@/utils/enums/projectCommon';

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

const wrapperSettings = () => ({
  props: {
    activityId: '123',
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
      Dialog: {
        name: 'Dialog',
        template: '<div class="dialog-stub">test</div>',
        props: ['visible']
      },
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
describe('NoteHistoryModal', () => {
  it('renders', () => {
    const wrapper = shallowMount(NoteHistoryModal, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });
});
