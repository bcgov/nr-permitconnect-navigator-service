import { flushPromises } from '@vue/test-utils';

import AuthorizationListNavigator from '@/components/authorization/AuthorizationListNavigator.vue';
import EnquiryListNavigator from '@/components/enquiry/EnquiryListNavigator.vue';
import ProjectListNavigator from '@/components/projectCommon/ProjectListNavigator.vue';
import SubmissionBringForwardCalendar from '@/components/submission/SubmissionBringForwardCalendar.vue';
import SubmissionsNavigator from '@/components/submission/SubmissionsNavigator.vue';
import SubmissionStatistics from '@/components/submission/SubmissionStatistics.vue';
import { Tab } from '@/lib/primevue';
import { Action, BasicResponse, GroupName, Initiative, Resource, StorageKey } from '@/utils/enums/application';
import { projectServiceKey } from '@/utils/keys';

import { mockAuthNStore, resetMockAuthNStore } from '../../../mockAuthNStore';
import { mountComponent } from '../../../mountComponent';

import type { BringForward, Enquiry, Group, Permission, Permit, Project, ProjectStatistics } from '@/types';

// Mocks

vi.mock('@/store/authnStore', () => ({
  default: () => mockAuthNStore,
  useAuthNStore: () => mockAuthNStore
}));

const mockToastError = vi.fn();

vi.mock('@/lib/primevue', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    useToast: () => ({ error: mockToastError })
  };
});

// Fixtures

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    projectId: 'project-1',
    activityId: 'activity-1',
    projectName: 'Project 1',
    ...overrides
  } as Project;
}

const notePermission: Permission = {
  group: GroupName.NAVIGATOR,
  initiative: Initiative.HOUSING,
  resource: Resource.NOTE,
  action: Action.READ
};

// Mount

function mountSubmissionsNavigator(
  options: {
    projects?: Project[];
    enquiries?: Enquiry[];
    permits?: Permit[];
    bringForward?: BringForward[];
    statistics?: ProjectStatistics;
    permissions?: Permission[];
    groups?: Group[];
    getProjectStatistics?: (req: unknown) => Promise<ProjectStatistics>;
  } = {}
) {
  const {
    projects = [],
    enquiries = [],
    permits = [],
    bringForward = [],
    statistics = undefined,
    permissions = [],
    groups = [],
    getProjectStatistics = vi.fn().mockResolvedValue({} as ProjectStatistics)
  } = options;

  const projectService = { getProjectStatistics };

  const { wrapper } = mountComponent(SubmissionsNavigator, {
    props: { projects, enquiries, permits, bringForward, statistics },
    piniaState: {
      app: { initiative: Initiative.HOUSING },
      authz: { permissions, groups }
    },
    provide: {
      [projectServiceKey as symbol]: { value: projectService }
    },
    stubs: {
      AuthorizationListNavigator: true,
      // ProjectListNavigator/EnquiryListNavigator inject router state
      // (route, router) that isn't provided in this test -- stubbed like the
      // other heavy leaf components. Props still pass through auto-stubs, so
      // the mutated `projects`/`enquiries` arrays remain inspectable.
      ProjectListNavigator: true,
      EnquiryListNavigator: true,
      SubmissionStatistics: true,
      SubmissionBringForwardCalendar: true,
      Escalation: true
    }
  });

  return { wrapper, getProjectStatistics };
}

/** `props('projects')` is typed as possibly-undefined via VTU's overloads -- narrow it once here. */
function getMutatedProjects(wrapper: ReturnType<typeof mountSubmissionsNavigator>['wrapper']): Project[] {
  return (wrapper.findComponent(ProjectListNavigator).props('projects') ?? []) as Project[];
}

beforeEach(() => {
  vi.clearAllMocks();
  resetMockAuthNStore();
  vi.spyOn(globalThis.sessionStorage, 'getItem').mockReturnValue(null);
  vi.spyOn(globalThis.sessionStorage, 'setItem').mockImplementation(() => {});
  vi.spyOn(globalThis.sessionStorage, 'removeItem').mockImplementation(() => {});
});

// Tests

describe('SubmissionsNavigator', () => {
  describe('rendering', () => {
    it('mounts without error', () => {
      const { wrapper } = mountSubmissionsNavigator();

      expect(wrapper.exists()).toBe(true);
    });

    it('shows the Bring Forward Calendar tab only when the user can read notes', () => {
      const { wrapper: withoutPermission } = mountSubmissionsNavigator({ permissions: [] });
      expect(withoutPermission.findAllComponents(Tab)).toHaveLength(4);

      const { wrapper: withPermission } = mountSubmissionsNavigator({ permissions: [notePermission] });
      expect(withPermission.findAllComponents(Tab)).toHaveLength(5);
    });

    it('shows a fallback message on the statistics tab when statistics failed to load', () => {
      const { wrapper } = mountSubmissionsNavigator({ statistics: undefined });

      expect(wrapper.findComponent(SubmissionStatistics).exists()).toBe(false);
      expect(wrapper.text()).toContain('Failed to load statistics.');
    });
  });

  describe('onBeforeMount project enrichment', () => {
    it('flags projects that have a related enquiry', () => {
      const project = makeProject({ activityId: 'activity-1' });
      const enquiry = { relatedActivityId: 'activity-1' } as Enquiry;

      const { wrapper } = mountSubmissionsNavigator({ projects: [project], enquiries: [enquiry] });

      expect(getMutatedProjects(wrapper)[0]!.hasRelatedEnquiry).toBe(true);
    });

    it('does not flag projects with no matching enquiry', () => {
      const project = makeProject({ activityId: 'activity-1' });

      const { wrapper } = mountSubmissionsNavigator({ projects: [project], enquiries: [] });

      expect(getMutatedProjects(wrapper)[0]!.hasRelatedEnquiry).toBe(false);
    });

    it.each([
      [{ firstName: 'John', lastName: 'Doe' }, 'Doe, John'],
      [{ firstName: 'John', lastName: undefined }, 'John'],
      [{ firstName: undefined, lastName: 'Doe' }, 'Doe'],
      [{ firstName: undefined, lastName: undefined }, '']
    ])('formats the assigned user full name %s -> %s', (nameParts, expected) => {
      const project = makeProject({ user: { ...nameParts, fullName: '' } as never });

      const { wrapper } = mountSubmissionsNavigator({ projects: [project] });

      expect(getMutatedProjects(wrapper)[0]!.user!.fullName).toBe(expected);
    });

    it('counts YES-needed permits per activity to build the multiPermitsNeeded label', () => {
      const project = makeProject({ activityId: 'activity-1' });
      const permits = [
        { activityId: 'activity-1', needed: 'yes' },
        { activityId: 'activity-1', needed: 'YES' },
        { activityId: 'activity-1', needed: 'No' },
        { activityId: 'other-activity', needed: 'Yes' }
      ] as Permit[];

      const { wrapper } = mountSubmissionsNavigator({ projects: [project], permits });

      expect(getMutatedProjects(wrapper)[0]!.multiPermitsNeeded).toBe(`${BasicResponse.YES} (2)`);
    });

    it('labels the project as not multi-permit when 1 or fewer permits are needed', () => {
      const project = makeProject({ activityId: 'activity-1' });
      const permits = [{ activityId: 'activity-1', needed: 'Yes' }] as Permit[];

      const { wrapper } = mountSubmissionsNavigator({ projects: [project], permits });

      expect(getMutatedProjects(wrapper)[0]!.multiPermitsNeeded).toBe(`${BasicResponse.NO} (1)`);
    });

    it('restores the accordion index from session storage', () => {
      vi.mocked(globalThis.sessionStorage.getItem).mockReturnValue('0');

      const { wrapper } = mountSubmissionsNavigator({ permissions: [notePermission] });

      expect(globalThis.sessionStorage.getItem).toHaveBeenCalledWith(StorageKey.BF_ACCORDION_IDX);
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('delete handlers', () => {
    it('removes the deleted project and its bring forwards, then refreshes statistics', async () => {
      const project = makeProject({ projectId: 'project-1', activityId: 'activity-1' });
      const bringForward = [
        { activityId: 'activity-1', noteHistoryId: 'n1', bringForwardDate: '2024-01-01' }
      ] as BringForward[];
      const getProjectStatistics = vi.fn().mockResolvedValue({ total_submissions: 1 } as ProjectStatistics);

      const { wrapper } = mountSubmissionsNavigator({ projects: [project], bringForward, getProjectStatistics });
      await wrapper.findComponent(ProjectListNavigator).vm.$emit('submission:delete', 'project-1', 'activity-1');
      await flushPromises();

      expect(wrapper.findComponent(ProjectListNavigator).props('projects')).toEqual([]);
      expect(getProjectStatistics).toHaveBeenCalledWith({});
    });

    it('shows an error toast when refreshing statistics fails after a project delete', async () => {
      const project = makeProject({ projectId: 'project-1', activityId: 'activity-1' });
      const getProjectStatistics = vi.fn().mockRejectedValue(new Error('BOOM'));

      const { wrapper } = mountSubmissionsNavigator({ projects: [project], getProjectStatistics });
      await wrapper.findComponent(ProjectListNavigator).vm.$emit('submission:delete', 'project-1', 'activity-1');
      await flushPromises();

      expect(mockToastError).toHaveBeenCalledWith('Failed to refresh statistics', 'BOOM');
    });

    it('removes the deleted enquiry and its bring forwards, then refreshes statistics', async () => {
      const enquiry = { enquiryId: 'enquiry-1', relatedActivityId: 'activity-1' } as Enquiry;
      const bringForward = [
        { activityId: 'activity-1', noteHistoryId: 'n1', bringForwardDate: '2024-01-01' }
      ] as BringForward[];
      const getProjectStatistics = vi.fn().mockResolvedValue({} as ProjectStatistics);

      const { wrapper } = mountSubmissionsNavigator({ enquiries: [enquiry], bringForward, getProjectStatistics });
      await wrapper.findComponent(EnquiryListNavigator).vm.$emit('enquiry:delete', 'enquiry-1', 'activity-1');
      await flushPromises();

      expect(wrapper.findComponent(EnquiryListNavigator).props('enquiries')).toEqual([]);
      expect(getProjectStatistics).toHaveBeenCalledWith({});
    });
  });

  describe('bring forward calendar', () => {
    it('passes bringForward and myAssignedTo through to the calendar tab', () => {
      const profile = { sub: 'user-sub' };
      mockAuthNStore.getProfile.value = profile as never;
      const project = makeProject({ projectId: 'project-1', user: { sub: 'user-sub' } as never });

      const { wrapper } = mountSubmissionsNavigator({ projects: [project] });

      const calendar = wrapper.findComponent(SubmissionBringForwardCalendar);
      expect(calendar.props('myAssignedTo')).toEqual(new Set(['project-1']));
    });
  });

  describe('authorization tab', () => {
    it('renders the AuthorizationListNavigator on the Authorizations tab', () => {
      const { wrapper } = mountSubmissionsNavigator();

      expect(wrapper.findComponent(AuthorizationListNavigator).exists()).toBe(true);
    });
  });
});
