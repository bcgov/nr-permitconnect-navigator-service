import { ref } from 'vue';

import NoteHistoryCard from '@/components/note/NoteHistoryCard.vue';
import ProjectNotesTab from '@/components/projectCommon/ProjectNotesTab.vue';
import { useProjectStore } from '@/store';
import { Action, GroupName, Initiative, Resource } from '@/utils/enums/application';
import { projectNoteRouteNameKey } from '@/utils/keys';

import { mockRouter, resetMockRouter } from '../../../mockRouter';
import { mountComponent } from '../../../mountComponent';

import type { NoteHistory, Permission } from '@/types';

// Mocks

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
  useRoute: () => ({ params: {}, query: {} })
}));

// Fixtures

const testNoteHistory = {
  noteHistoryId: 'note-1',
  createdAt: '2024-01-01T00:00:00.000Z'
} as unknown as NoteHistory;

// Mount

function mountProjectNotesTab(
  options: {
    project?: Record<string, unknown>;
    noteHistory?: NoteHistory[];
    canCreate?: boolean;
  } = {}
) {
  const { project = { projectId: 'project-1' }, noteHistory = [], canCreate = true } = options;

  const permissions: Permission[] = canCreate
    ? [{ group: GroupName.DEVELOPER, initiative: Initiative.HOUSING, resource: Resource.NOTE, action: Action.CREATE }]
    : [];

  const { wrapper, pinia } = mountComponent(ProjectNotesTab, {
    piniaState: {
      app: { initiative: Initiative.HOUSING },
      authz: { permissions, groups: canCreate ? [{ name: GroupName.DEVELOPER }] : [] },
      project: { project, noteHistory }
    },
    provide: {
      [projectNoteRouteNameKey as symbol]: ref('note-route')
    },
    stubs: { NoteHistoryCard: true }
  });

  return { wrapper, pinia };
}

beforeEach(() => {
  vi.clearAllMocks();
  resetMockRouter();
});

// Tests

describe('ProjectNotesTab', () => {
  describe('rendering', () => {
    it('shows the note count', () => {
      const { wrapper } = mountProjectNotesTab({ noteHistory: [testNoteHistory, testNoteHistory] });

      expect(wrapper.text()).toContain('Notes (2)');
    });

    it('renders a NoteHistoryCard per note', () => {
      const { wrapper } = mountProjectNotesTab({ noteHistory: [testNoteHistory] });

      const cards = wrapper.findAllComponents(NoteHistoryCard);
      expect(cards).toHaveLength(1);
      expect(cards[0]!.props('noteHistory')).toEqual(testNoteHistory);
    });

    it('disables the add note button when the user lacks create permission', () => {
      const { wrapper } = mountProjectNotesTab({ canCreate: false });

      expect(wrapper.find('button').attributes('disabled')).toBeDefined();
    });

    it('enables the add note button when the user has create permission', () => {
      const { wrapper } = mountProjectNotesTab({ canCreate: true });

      expect(wrapper.find('button').attributes('disabled')).toBeUndefined();
    });
  });

  describe('user interaction', () => {
    it('navigates to the add note route when the add note button is clicked', async () => {
      const { wrapper } = mountProjectNotesTab({ project: { projectId: 'project-1' } });

      await wrapper.find('button').trigger('click');

      expect(mockRouter.push).toHaveBeenCalledWith({
        name: 'note-route',
        params: { projectId: 'project-1' }
      });
    });

    it('navigates to the edit note route when the card emits editNoteHistory', async () => {
      const { wrapper } = mountProjectNotesTab({
        project: { projectId: 'project-1' },
        noteHistory: [testNoteHistory]
      });

      await wrapper.findComponent(NoteHistoryCard).vm.$emit('editNoteHistory', 'note-1');

      expect(mockRouter.push).toHaveBeenCalledWith({
        name: 'note-route',
        params: { noteHistoryId: 'note-1', projectId: 'project-1' }
      });
    });

    it('removes the note from the store when the card emits deleteNoteHistory', async () => {
      const { wrapper, pinia } = mountProjectNotesTab({ noteHistory: [testNoteHistory] });
      const projectStore = useProjectStore(pinia);

      await wrapper.findComponent(NoteHistoryCard).vm.$emit('deleteNoteHistory', testNoteHistory);

      expect(projectStore.removeNoteHistory).toHaveBeenCalledWith(testNoteHistory);
    });

    it('updates the note in the store when the card emits updateNoteHistory', async () => {
      const { wrapper, pinia } = mountProjectNotesTab({ noteHistory: [testNoteHistory] });
      const projectStore = useProjectStore(pinia);

      await wrapper.findComponent(NoteHistoryCard).vm.$emit('updateNoteHistory', testNoteHistory);

      expect(projectStore.updateNoteHistory).toHaveBeenCalledWith(testNoteHistory);
    });
  });
});
