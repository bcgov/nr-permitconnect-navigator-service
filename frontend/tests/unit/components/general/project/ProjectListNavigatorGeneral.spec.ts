import { defineComponent, h, ref } from 'vue';
import PrimeVue from 'primevue/config';
import { mount, RouterLinkStub } from '@vue/test-utils';

import ProjectListNavigatorGeneral from '@/components/general/project/ProjectListNavigatorGeneral.vue';
import { Column } from '@/lib/primevue';
import { Action, Initiative, Resource, RouteName } from '@/utils/enums/application';
import { projectRouteNameKey, resourceKey } from '@/utils/keys';

import { mountComponent } from '../../../../mountComponent';

import type { VueWrapper } from '@vue/test-utils';
import type { GeneralProject } from '@/types';

// Fixtures

const testProject = {
  projectId: 'project-1',
  activityId: 'activity-1',
  projectName: 'Test Project',
  companyNameRegistered: 'Test Co',
  location: 'Victoria, BC',
  submittedAt: '2024-01-01T00:00:00.000Z',
  queuePriority: 1,
  multiPermitsNeeded: 'No',
  user: { fullName: 'Jane Doe' },
  activity: {
    activityContact: [{ contact: { firstName: 'John', lastName: 'Smith' } }]
  }
} as unknown as GeneralProject;

// Mount

function mountProjectListNavigatorGeneral(
  options: {
    onDeleteCallback?: (projectId: string, activityId: string) => void;
    permissions?: { initiative: Initiative; resource: unknown; action: Action }[];
  } = {}
) {
  const { onDeleteCallback = vi.fn(), permissions = [] } = options;

  const { wrapper } = mountComponent(ProjectListNavigatorGeneral, {
    props: { onDeleteCallback },
    piniaState: {
      app: { initiative: Initiative.GENERAL },
      authz: { permissions }
    },
    provide: {
      [projectRouteNameKey as symbol]: ref(RouteName.INT_GENERAL_PROJECT),
      [resourceKey as symbol]: ref(Resource.GENERAL_PROJECT),
      // Mounted without a real `<DataTable>` ancestor (see `renderColumnBody`
      // above), so `<Column>`'s own `inject: ['$columns']` would otherwise
      // warn on every column that it found no provider.
      $columns: { add: () => {}, delete: () => {} }
    }
  });

  return { wrapper, onDeleteCallback };
}

/**
 * PrimeVue's `<Column>` only registers itself with an ancestor `<DataTable>`
 * when it's a *direct* slot child -- nesting it one component-level deeper
 * (as every column here is, since they're all defined by this component
 * rather than written inline in a `<DataTable>` template) causes DataTable
 * to silently detect zero columns, even though the exact same nesting
 * pattern is what production code does. Rather than fight that, render each
 * column's `body` scoped slot directly against a fixture row and inspect
 * the output -- that's the only real logic this component has anyway.
 */
function renderColumnBody(column: VueWrapper, data: unknown) {
  const vnodes = column.vm.$slots.body?.({ data }) ?? [];
  const Host = defineComponent({ render: () => h('div', vnodes) });

  return mount(Host, {
    global: { plugins: [PrimeVue], stubs: { RouterLink: RouterLinkStub, 'font-awesome-icon': true } }
  });
}

function findColumnByField(wrapper: VueWrapper, field: string) {
  return wrapper.findAllComponents(Column).find((c) => c.props('field') === field)!;
}

beforeEach(() => {
  vi.clearAllMocks();
});

// Tests

describe('ProjectListNavigatorGeneral', () => {
  describe('rendering', () => {
    it('mounts without error', () => {
      const { wrapper } = mountProjectListNavigatorGeneral();

      expect(wrapper.exists()).toBe(true);
    });

    it('defines the expected columns', () => {
      const { wrapper } = mountProjectListNavigatorGeneral();

      const fields = wrapper.findAllComponents(Column).map((c) => c.props('field'));

      expect(fields).toEqual([
        'projectName',
        'activityId',
        'activity.activityContact.0.contact.firstName',
        'activity.activityContact.0.contact.lastName',
        'companyNameRegistered',
        'location',
        'submittedAt',
        'queuePriority',
        'multiPermitsNeeded',
        'user.fullName',
        null
      ]);
    });

    it('renders the project name as a link to the project route', () => {
      const { wrapper } = mountProjectListNavigatorGeneral();
      const cell = renderColumnBody(findColumnByField(wrapper, 'projectName'), testProject);

      expect(cell.find('[data-projectname]').text()).toBe(testProject.projectName);
      expect(cell.findComponent(RouterLinkStub).props('to')).toEqual({
        name: RouteName.INT_GENERAL_PROJECT,
        params: { projectId: testProject.projectId }
      });
    });

    it('renders the activityId as plain text when a project name is present', () => {
      const { wrapper } = mountProjectListNavigatorGeneral();
      const cell = renderColumnBody(findColumnByField(wrapper, 'activityId'), testProject);

      expect(cell.findComponent(RouterLinkStub).exists()).toBe(false);
      expect(cell.find('[data-activityid]').text()).toBe(testProject.activityId);
    });

    it('renders the activityId as a link when no project name is present', () => {
      const { wrapper } = mountProjectListNavigatorGeneral();
      const cell = renderColumnBody(findColumnByField(wrapper, 'activityId'), { ...testProject, projectName: '' });

      expect(cell.findComponent(RouterLinkStub).exists()).toBe(true);
      expect(cell.findComponent(RouterLinkStub).props('to')).toEqual({
        name: RouteName.INT_GENERAL_PROJECT,
        params: { projectId: testProject.projectId }
      });
    });
  });

  describe('delete action', () => {
    function renderActionCell(wrapper: VueWrapper, data: unknown) {
      const actionColumn = wrapper.findAllComponents(Column).find((c) => c.props('header') === 'Action')!;
      return renderColumnBody(actionColumn, data);
    }

    it('disables the delete button when the user lacks delete permission', () => {
      const { wrapper } = mountProjectListNavigatorGeneral({ permissions: [] });
      const cell = renderActionCell(wrapper, testProject);

      expect(cell.find('button').attributes('disabled')).toBeDefined();
    });

    it('enables the delete button and invokes the callback when the user has permission', async () => {
      const { wrapper, onDeleteCallback } = mountProjectListNavigatorGeneral({
        permissions: [{ initiative: Initiative.GENERAL, resource: Resource.GENERAL_PROJECT, action: Action.DELETE }]
      });
      const cell = renderActionCell(wrapper, testProject);

      const deleteButton = cell.find('button');
      expect(deleteButton.attributes('disabled')).toBeUndefined();

      await deleteButton.trigger('click');

      expect(onDeleteCallback).toHaveBeenCalledWith(testProject.projectId, testProject.activityId);
    });
  });
});
