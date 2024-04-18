import { createTestingPinia } from '@pinia/testing';
import { mount } from '@vue/test-utils';

import NoteModal from '@/components/note/NoteModal.vue';
import { StorageKey } from '@/utils/constants';
import { NOTE_TYPES } from '@/utils/enums';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

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
  noteType: NOTE_TYPES.GENERAL,
  title: 'note contents title',
  createdBy: 'testCreatedBy',
  createdAt: currentDate,
  updatedBy: 'testUpdatedAt',
  updatedAt: currentDate,
  isDeleted: false
};

const wrapperSettings = (visibleProp: boolean = true) => ({
  props: {
    note: testNote,
    visible: visibleProp
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
describe('noteModal test', () => {
  it('sets dialog component prop "visible" to true', async () => {
    const noteWrapper = mount(NoteModal, wrapperSettings(true));

    const dialogComponent = noteWrapper.getComponent({ name: 'Dialog' });
    expect(dialogComponent.props('visible')).toBe(true);
  });

  it('sets dialog component prop "visible" to false', async () => {
    const noteWrapper = mount(NoteModal, wrapperSettings(false));

    const dialogComponent = noteWrapper.getComponent({ name: 'Dialog' });
    expect(dialogComponent.props('visible')).toBe(false);
  });
});
