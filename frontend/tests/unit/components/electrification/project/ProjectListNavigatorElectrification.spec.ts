import { defineComponent, h, ref } from 'vue';
import PrimeVue from 'primevue/config';
import { mount, RouterLinkStub } from '@vue/test-utils';

import ProjectListNavigatorElectrification from '@/components/electrification/project/ProjectListNavigatorElectrification.vue';
import { Column } from '@/lib/primevue';
import { Action, Initiative, Resource, RouteName } from '@/utils/enums/application';
import { ElectrificationProjectType } from '@/utils/enums/codeEnums';
import { projectRouteNameKey, resourceKey } from '@/utils/keys';

import { mountComponent } from '../../../../mountComponent';

import type { VueWrapper } from '@vue/test-utils';
import type { ElectrificationProject } from '@/types';

// Fixtures

const testProject = {
  projectId: 'project-1',
  activityId: 'activity-1',
  projectName: 'Test Project',
  projectType: ElectrificationProjectType.IPP_SOLAR,
  companyNameRegistered: 'Test Co',
  submittedAt: '2024-01-01T00:00:00.000Z',
  queuePriority: 1,
  multiPermitsNeeded: 'No',
  user: { fullName: 'Jane Doe' },
  activity: {
    activityContact: [{ contact: { firstName: 'John', lastName: 'Smith' } }]
  }
} as unknown as ElectrificationProject;

// Mount

function mountProjectListNavigatorElectrification(
  options: {
    onDeleteCallback?: (projectId: string, activityId: string) => void;
    permissions?: { initiative: Initiative; resource: unknown; action: Action }[];
  } = {}
) {
  const { onDeleteCallback = vi.fn(), permissions = [] } = options;

  const { wrapper } = mountComponent(ProjectListNavigatorElectrification, {
    props: { onDeleteCallback },
    piniaState: {
      app: { initiative: Initiative.ELECTRIFICATION },
      authz: { permissions },
      code: {
        codes: {
          ElectrificationProjectType: [{ code: ElectrificationProjectType.IPP_SOLAR, display: 'IPP Solar' }]
        }
      }
    },
    provide: {
      [projectRouteNameKey as symbol]: ref(RouteName.INT_ELECTRIFICATION_PROJECT),
      [resourceKey as symbol]: ref(Resource.ELECTRIFICATION_PROJECT),
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

describe('ProjectListNavigatorElectrification', () => {
  describe('rendering', () => {
    it('mounts without error', () => {
      const { wrapper } = mountProjectListNavigatorElectrification();

      expect(wrapper.exists()).toBe(true);
    });

    it('defines the expected columns', () => {
      const { wrapper } = mountProjectListNavigatorElectrification();

      const fields = wrapper.findAllComponents(Column).map((c) => c.props('field'));

      expect(fields).toEqual([
        'projectName',
        'activityId',
        'projectType',
        'companyNameRegistered',
        'activity.activityContact.0.contact.firstName',
        'activity.activityContact.0.contact.lastName',
        'user.fullName',
        'submittedAt',
        'multiPermitsNeeded',
        'queuePriority',
        null
      ]);
    });

    it('renders the project name as a link to the project route', () => {
      const { wrapper } = mountProjectListNavigatorElectrification();
      const cell = renderColumnBody(findColumnByField(wrapper, 'projectName'), testProject);

      expect(cell.find('[data-projectName]').text()).toBe(testProject.projectName);
      expect(cell.findComponent(RouterLinkStub).props('to')).toEqual({
        name: RouteName.INT_ELECTRIFICATION_PROJECT,
        params: { projectId: testProject.projectId }
      });
    });

    it('renders the activityId as plain text when a project name is present', () => {
      const { wrapper } = mountProjectListNavigatorElectrification();
      const cell = renderColumnBody(findColumnByField(wrapper, 'activityId'), testProject);

      expect(cell.findComponent(RouterLinkStub).exists()).toBe(false);
      expect(cell.find('[data-activityId]').text()).toBe(testProject.activityId);
    });

    it('renders the activityId as a link when no project name is present', () => {
      const { wrapper } = mountProjectListNavigatorElectrification();
      const cell = renderColumnBody(findColumnByField(wrapper, 'activityId'), { ...testProject, projectName: '' });

      expect(cell.findComponent(RouterLinkStub).exists()).toBe(true);
      expect(cell.findComponent(RouterLinkStub).props('to')).toEqual({
        name: RouteName.INT_ELECTRIFICATION_PROJECT,
        params: { projectId: testProject.projectId }
      });
    });

    it('renders the project type using the code display value', () => {
      const { wrapper } = mountProjectListNavigatorElectrification();
      const cell = renderColumnBody(findColumnByField(wrapper, 'projectType'), testProject);

      expect(cell.text()).toBe('IPP Solar');
    });
  });

  describe('delete action', () => {
    function renderActionCell(wrapper: VueWrapper, data: unknown) {
      const actionColumn = wrapper.findAllComponents(Column).find((c) => c.props('header') === 'Action')!;
      return renderColumnBody(actionColumn, data);
    }

    it('disables the delete button when the user lacks delete permission', () => {
      const { wrapper } = mountProjectListNavigatorElectrification({ permissions: [] });
      const cell = renderActionCell(wrapper, testProject);

      expect(cell.find('button').attributes('disabled')).toBeDefined();
    });

    it('enables the delete button and invokes the callback when the user has permission', async () => {
      const { wrapper, onDeleteCallback } = mountProjectListNavigatorElectrification({
        permissions: [
          { initiative: Initiative.ELECTRIFICATION, resource: Resource.ELECTRIFICATION_PROJECT, action: Action.DELETE }
        ]
      });
      const cell = renderActionCell(wrapper, testProject);

      const deleteButton = cell.find('button');
      expect(deleteButton.attributes('disabled')).toBeUndefined();

      await deleteButton.trigger('click');

      expect(onDeleteCallback).toHaveBeenCalledWith(testProject.projectId, testProject.activityId);
    });
  });
});
