import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { shallowMount } from '@vue/test-utils';

import NoteModal from '@/components/note/NoteModal.vue';

import { StorageKey } from '@/utils/enums/application';
import { NoteType } from '@/utils/enums/housing';

import type { Note } from '@/types';

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  })
}));
const currentDate = new Date().toISOString();

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

const wrapperSettings = () => ({
  props: {
    activityId: '123',
    note: testNote
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
describe('NoteModal', () => {
  it('renders', () => {
    const wrapper = shallowMount(NoteModal, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });
});
