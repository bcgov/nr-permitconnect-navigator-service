import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { mount } from '@vue/test-utils';
import { nextTick, ref } from 'vue';

import { DatePicker, InputText, Select, TextArea } from '@/components/form';
import NoteForm from '@/components/note/NoteForm.vue';
import { userService } from '@/services';

import { StorageKey } from '@/utils/enums/application';
import { NoteType } from '@/utils/enums/projectCommon';

import { mockRouter, resetMockRouter } from '../../../mockRouter';

import type { Note, NoteHistory, User } from '@/types';
import { enquiryRouteNameKey, projectEnquiryRouteNameKey, projectRouteNameKey, resourceKey } from '@/utils/keys';

// Mocks

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key
  })
}));

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter
}));

// Fixtures

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

const wrapperSettings = (options: { noteHistory?: NoteHistory; editable?: boolean } = {}) => ({
  props: {
    noteHistory: 'noteHistory' in options ? options.noteHistory : TEST_NOTE_HISTORY,
    editable: options.editable ?? true
  },
  global: {
    plugins: [
      () =>
        createTestingPinia({
          initialState: {
            auth: {
              user: {}
            },
            code: {
              options: {
                EscalationType: []
              }
            }
          }
        }),
      PrimeVue,
      ConfirmationService,
      ToastService
    ],
    provide: {
      [projectRouteNameKey as symbol]: ref('project-route-name'),
      [enquiryRouteNameKey as symbol]: ref('enquiry-route-name'),
      [projectEnquiryRouteNameKey as symbol]: ref('project-enquiry-route-name'),
      [resourceKey as symbol]: ref('resource-key')
    },
    stubs: {
      'font-awesome-icon': true
    }
  }
});

beforeEach(() => {
  resetMockRouter();
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
  searchUsersSpy.mockResolvedValue([{ fullName: 'dummyName' }] as User[]);
});

afterEach(() => {
  sessionStorage.clear();
});

// Tests

describe('NoteForm', () => {
  describe('rendering', () => {
    describe('mandatory fields', () => {
      it('renders Select for type with correct name', () => {
        const wrapper = mount(NoteForm, wrapperSettings());

        const selects = wrapper.findAllComponents(Select);
        const typeSelect = selects.find((select) => select.props('name') === 'type');

        expect(typeSelect).toBeTruthy();
      });

      it('renders InputText for title with correct name', () => {
        const wrapper = mount(NoteForm, wrapperSettings());

        const titleInput = wrapper.findComponent(InputText);

        expect(titleInput.props('name')).toBe('title');
        expect(titleInput.props('required')).toBe(true);
      });
      describe('Note', () => {
        it('renders', () => {
          const wrapper = mount(NoteForm, wrapperSettings());

          const noteTextArea = wrapper.findComponent(TextArea);

          expect(noteTextArea.props('name')).toBe('note');
        });
        it('displays an asterisk when creating a note', () => {
          const wrapper = mount(NoteForm, wrapperSettings({ noteHistory: undefined }));

          const headings = wrapper.findAll('h6');
          const noteHeading = headings.find((h) => h.text().includes('note.noteForm.note'));
          const asterisk = noteHeading?.findAll('span')?.find((span) => span.text() === '*');

          expect(asterisk).toBeTruthy();
        });
      });
      it('renders DatePicker for bringForwardDate when type is BRING_FORWARD', async () => {
        const wrapper = mount(
          NoteForm,
          wrapperSettings({
            noteHistory: { ...TEST_NOTE_HISTORY, type: NoteType.BRING_FORWARD }
          })
        );

        await nextTick();

        const datePicker = wrapper.findComponent(DatePicker);

        expect(datePicker.props('name')).toBe('bringForwardDate');
      });
    });
  });
});
