import { defineComponent, h, ref } from 'vue';
import PrimeVue from 'primevue/config';
import { mount, RouterLinkStub } from '@vue/test-utils';

import ProjectListNavigatorHousing from '@/components/housing/project/ProjectListNavigatorHousing.vue';
import { Column } from '@/lib/primevue';
import { Action, BasicResponse, Initiative, Resource, RouteName } from '@/utils/enums/application';
import { projectRouteNameKey, resourceKey } from '@/utils/keys';

import { mountComponent } from '../../../../mountComponent';

import type { VueWrapper } from '@vue/test-utils';
import type { HousingProject } from '@/types';

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
  hasRentalUnits: 'Yes',
  financiallySupported: true,
  naturalDisaster: false,
  user: { fullName: 'Jane Doe' },
  activity: {
    activityContact: [{ contact: { firstName: 'John', lastName: 'Smith' } }]
  }
} as unknown as HousingProject;

// Mount

function mountProjectListNavigatorHousing(
  options: {
    onDeleteCallback?: (projectId: string, activityId: string) => void;
    permissions?: { initiative: Initiative; resource: unknown; action: Action }[];
  } = {}
) {
  const { onDeleteCallback = vi.fn(), permissions = [] } = options;

  const { wrapper } = mountComponent(ProjectListNavigatorHousing, {
    props: { onDeleteCallback },
    piniaState: {
      app: { initiative: Initiative.HOUSING },
      authz: { permissions }
    },
    provide: {
      [projectRouteNameKey as symbol]: ref(RouteName.INT_HOUSING_PROJECT),
      [resourceKey as symbol]: ref(Resource.HOUSING_PROJECT),
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

describe('ProjectListNavigatorHousing', () => {
  describe('rendering', () => {
    it('mounts without error', () => {
      const { wrapper } = mountProjectListNavigatorHousing();

      expect(wrapper.exists()).toBe(true);
    });

    it('defines the expected columns', () => {
      const { wrapper } = mountProjectListNavigatorHousing();

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
        'hasRentalUnits',
        'financiallySupported',
        'naturalDisaster',
        null
      ]);
    });

    it('renders the project name as a link to the project route', () => {
      const { wrapper } = mountProjectListNavigatorHousing();
      const cell = renderColumnBody(findColumnByField(wrapper, 'projectName'), testProject);

      expect(cell.find('[data-projectName]').text()).toBe(testProject.projectName);
      expect(cell.findComponent(RouterLinkStub).props('to')).toEqual({
        name: RouteName.INT_HOUSING_PROJECT,
        params: { projectId: testProject.projectId }
      });
    });

    it('renders the activityId as plain text when a project name is present', () => {
      const { wrapper } = mountProjectListNavigatorHousing();
      const cell = renderColumnBody(findColumnByField(wrapper, 'activityId'), testProject);

      expect(cell.findComponent(RouterLinkStub).exists()).toBe(false);
      expect(cell.find('[data-activityId]').text()).toBe(testProject.activityId);
    });

    it('renders the activityId as a link when no project name is present', () => {
      const { wrapper } = mountProjectListNavigatorHousing();
      const cell = renderColumnBody(findColumnByField(wrapper, 'activityId'), { ...testProject, projectName: '' });

      expect(cell.findComponent(RouterLinkStub).exists()).toBe(true);
      expect(cell.findComponent(RouterLinkStub).props('to')).toEqual({
        name: RouteName.INT_HOUSING_PROJECT,
        params: { projectId: testProject.projectId }
      });
    });

    it.each([
      ['financiallySupported', true, BasicResponse.YES],
      ['financiallySupported', false, BasicResponse.NO],
      ['naturalDisaster', true, BasicResponse.YES],
      ['naturalDisaster', false, BasicResponse.NO]
    ])('renders %s as %s -> %s', (field, value, expected) => {
      const { wrapper } = mountProjectListNavigatorHousing();
      const cell = renderColumnBody(findColumnByField(wrapper, field), { ...testProject, [field]: value });

      expect(cell.text()).toBe(expected);
    });
  });

  describe('delete action', () => {
    function renderActionCell(wrapper: VueWrapper, data: unknown) {
      const actionColumn = wrapper.findAllComponents(Column).find((c) => c.props('header') === 'Action')!;
      return renderColumnBody(actionColumn, data);
    }

    it('disables the delete button when the user lacks delete permission', () => {
      const { wrapper } = mountProjectListNavigatorHousing({ permissions: [] });
      const cell = renderActionCell(wrapper, testProject);

      expect(cell.find('button').attributes('disabled')).toBeDefined();
    });

    it('enables the delete button and invokes the callback when the user has permission', async () => {
      const { wrapper, onDeleteCallback } = mountProjectListNavigatorHousing({
        permissions: [{ initiative: Initiative.HOUSING, resource: Resource.HOUSING_PROJECT, action: Action.DELETE }]
      });
      const cell = renderActionCell(wrapper, testProject);

      const deleteButton = cell.find('button');
      expect(deleteButton.attributes('disabled')).toBeUndefined();

      await deleteButton.trigger('click');

      expect(onDeleteCallback).toHaveBeenCalledWith(testProject.projectId, testProject.activityId);
    });
  });
});
