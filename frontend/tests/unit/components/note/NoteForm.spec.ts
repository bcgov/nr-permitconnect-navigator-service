import { nextTick, ref } from 'vue';

import { DatePicker, InputText, Select, TextArea } from '@/components/form';
import NoteForm from '@/components/note/NoteForm.vue';
import { userService } from '@/services';

import { NoteType } from '@/utils/enums/projectCommon';

import { mountComponent } from '../../../mountComponent';
import { mockRouter, resetMockRouter } from '../../../mockRouter';

import type { Note, NoteHistory, User } from '@/types';
import { enquiryRouteNameKey, projectEnquiryRouteNameKey, projectRouteNameKey, resourceKey } from '@/utils/keys';

// Mocks

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key
  }),
  createI18n: vi.fn(() => ({
    global: {
      t: (key: string) => key
    },
    install: vi.fn()
  }))
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

// Mount

function mountNoteForm(options: { noteHistory?: NoteHistory; editable?: boolean } = {}) {
  // A plain default would swallow an explicit `undefined`.
  const noteHistory = 'noteHistory' in options ? options.noteHistory : TEST_NOTE_HISTORY;
  const editable = options.editable ?? true;

  const { wrapper } = mountComponent(NoteForm, {
    props: { noteHistory, editable },
    piniaState: {
      auth: { user: {} },
      code: { options: { EscalationType: [] } }
    },
    provide: {
      [projectRouteNameKey]: ref('project-route-name'),
      [enquiryRouteNameKey]: ref('enquiry-route-name'),
      [projectEnquiryRouteNameKey]: ref('project-enquiry-route-name'),
      [resourceKey]: ref('resource-key')
    }
  });

  return { wrapper };
}

beforeEach(() => {
  resetMockRouter();
  vi.clearAllMocks();
  searchUsersSpy.mockResolvedValue([{ fullName: 'dummyName' }] as User[]);
});

// Tests

describe('NoteForm', () => {
  describe('rendering', () => {
    describe('mandatory fields', () => {
      it('renders Select for type with correct name', () => {
        const { wrapper } = mountNoteForm();

        const selects = wrapper.findAllComponents(Select);
        const typeSelect = selects.find((select) => select.props('name') === 'type');

        expect(typeSelect).toBeTruthy();
      });

      it('renders InputText for title with correct name', () => {
        const { wrapper } = mountNoteForm();

        const titleInput = wrapper.findComponent(InputText);

        expect(titleInput.props('name')).toBe('title');
        expect(titleInput.props('required')).toBe(true);
      });

      describe('note', () => {
        it('renders a TextArea bound to note', () => {
          const { wrapper } = mountNoteForm();

          const noteTextArea = wrapper.findComponent(TextArea);

          expect(noteTextArea.props('name')).toBe('note');
        });

        it('displays an asterisk when creating a note', () => {
          const { wrapper } = mountNoteForm({ noteHistory: undefined });

          const headings = wrapper.findAll('h6');
          const noteHeading = headings.find((h) => h.text().includes('note.noteForm.note'));
          const asterisk = noteHeading?.findAll('span')?.find((span) => span.text() === '*');

          expect(asterisk).toBeTruthy();
        });
      });

      it('renders DatePicker for bringForwardDate when type is BRING_FORWARD', async () => {
        const { wrapper } = mountNoteForm({
          noteHistory: { ...TEST_NOTE_HISTORY, type: NoteType.BRING_FORWARD }
        });

        await nextTick();

        const datePicker = wrapper.findComponent(DatePicker);

        expect(datePicker.props('name')).toBe('bringForwardDate');
      });
    });
  });
});
