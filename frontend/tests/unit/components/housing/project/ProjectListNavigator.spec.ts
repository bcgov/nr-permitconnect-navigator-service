import { ref } from 'vue';

import ProjectListNavigator from '@/components/projectCommon/ProjectListNavigator.vue';
import ProjectListNavigatorElectrification from '@/components/electrification/project/ProjectListNavigatorElectrification.vue';
import ProjectListNavigatorGeneral from '@/components/general/project/ProjectListNavigatorGeneral.vue';
import ProjectListNavigatorHousing from '@/components/housing/project/ProjectListNavigatorHousing.vue';
import { DataTable } from '@/lib/primevue';
import { useAppStore, useAuthZStore } from '@/store';
import { Action, BasicResponse, Initiative } from '@/utils/enums/application';
import { NumResidentialUnits } from '@/utils/enums/housing';
import { ApplicationStatus, ProjectApplicant, SubmissionType } from '@/utils/enums/projectCommon';
import { projectRouteNameKey, projectServiceKey, resourceKey } from '@/utils/keys';

import { mountComponent } from '../../../../mountComponent';

import type { Pinia } from 'pinia';
import type { HousingProject } from '@/types';

// Mocks

// `useRoute` is a vi.fn() (rather than returning a fixed object) so
// individual tests can override its return value to exercise the
// query-string-driven pagination logic in the component.
const mockUseRoute = vi.fn(() => ({ query: {} as Record<string, string> }));
const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock('vue-router', () => ({
  useRoute: () => mockUseRoute(),
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    currentRoute: { value: { name: 'route-name' } }
  })
}));

// Fixtures

const PROVIDED_RESOURCE = 'resource';

const testProject: HousingProject = {
  activityId: 'activity456',
  housingProjectId: 'project789',
  projectId: 'project789',
  queuePriority: 1,
  submissionType: SubmissionType.ASSISTANCE,
  submittedAt: '2023-01-01T12:00:00Z',
  relatedEnquiries: 'enquiry123',
  hasRelatedEnquiry: true,
  companyIdRegistered: 'FM0281610',
  companyNameRegistered: 'Example Company',
  consentToFeedback: true,
  projectName: 'Project Alpha',
  projectDescription: 'This is a test project description.',
  projectLocationDescription: 'Test location description.',
  singleFamilyUnits: NumResidentialUnits.ONE_TO_NINE,
  multiFamilyUnits: NumResidentialUnits.UNSURE,
  multiPermitsNeeded: 'Yes',
  otherUnitsDescription: 'Other units description.',
  otherUnits: NumResidentialUnits.UNSURE,
  hasRentalUnits: BasicResponse.YES,
  rentalUnits: '15',
  financiallySupportedBc: BasicResponse.YES,
  financiallySupportedIndigenous: BasicResponse.YES,
  indigenousDescription: 'Indigenous support description.',
  financiallySupportedNonProfit: BasicResponse.YES,
  nonProfitDescription: 'Non-profit support description.',
  financiallySupportedHousingCoop: BasicResponse.YES,
  housingCoopDescription: 'Housing coop support description.',
  streetAddress: '123 Main St',
  locality: 'Anytown',
  province: 'BC',
  locationPids: '123456789',
  latitude: 49.2827,
  longitude: -123.1207,
  geomarkUrl: 'http://example.com/geomark',
  naturalDisaster: false,
  addedToAts: true,
  atsClientId: 654321,
  atsEnquiryId: 654321,
  ltsaCompleted: true,
  bcOnlineCompleted: true,
  aaiUpdated: true,
  astNotes: 'AST notes.',
  applicationStatus: ApplicationStatus.COMPLETED,
  projectApplicantType: ProjectApplicant.INDIVIDUAL,
  hasAppliedProvincialPermits: false,
  projectLocation: '',
  contacts: []
};

const testProjects = [testProject];

// Mount

function mountProjectListNavigator(
  options: {
    props?: Partial<{ projects: HousingProject[]; loading: boolean }>;
    initiative?: Initiative;
    permissions?: { initiative: Initiative; resource: unknown; action: Action; group?: unknown }[];
  } = {}
) {
  const { props = {}, initiative, permissions } = options;

  const { wrapper, pinia } = mountComponent(ProjectListNavigator, {
    props: {
      projects: testProjects,
      loading: false,
      ...props
    },
    piniaState: {
      auth: { user: {} },
      ...(initiative === undefined ? {} : { app: { initiative } }),
      ...(permissions === undefined ? {} : { authz: { permissions } })
    },
    provide: {
      [projectRouteNameKey as symbol]: { value: 'route-name' },
      [projectServiceKey as symbol]: { value: { foo: vi.fn() } },
      [resourceKey as symbol]: ref(PROVIDED_RESOURCE)
    },
    stubs: {
      ProjectListNavigatorHousing: true,
      ProjectListNavigatorGeneral: true,
      ProjectListNavigatorElectrification: true
    }
  });

  return {
    wrapper,
    appStore: useAppStore(pinia as Pinia),
    authzStore: useAuthZStore(pinia as Pinia)
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockUseRoute.mockReturnValue({ query: {} });
});

// Tests

describe('ProjectListNavigator', () => {
  it('renders with the provided props', () => {
    const { wrapper } = mountProjectListNavigator();

    expect(wrapper.exists()).toBe(true);
  });

  describe('initiative-based child navigator', () => {
    it.each([
      { initiative: Initiative.HOUSING, expected: ProjectListNavigatorHousing },
      { initiative: Initiative.GENERAL, expected: ProjectListNavigatorGeneral },
      { initiative: Initiative.ELECTRIFICATION, expected: ProjectListNavigatorElectrification }
    ])(
      'renders only the $initiative navigator when the current initiative is $initiative',
      ({ initiative, expected }) => {
        const { wrapper } = mountProjectListNavigator({ initiative });

        const allNavigators = [
          ProjectListNavigatorHousing,
          ProjectListNavigatorGeneral,
          ProjectListNavigatorElectrification
        ];

        for (const navigator of allNavigators) {
          expect(wrapper.findComponent(navigator).exists()).toBe(navigator === expected);
        }
      }
    );
  });

  describe('create submission button', () => {
    it('is shown when a matching permission exists', () => {
      const { wrapper } = mountProjectListNavigator({
        initiative: Initiative.HOUSING,
        permissions: [{ initiative: Initiative.HOUSING, resource: PROVIDED_RESOURCE, action: Action.CREATE }]
      });

      expect(wrapper.find('[type="submit"]').exists()).toBe(true);
    });

    it('is hidden when no permission matches', () => {
      const { wrapper } = mountProjectListNavigator({
        initiative: Initiative.HOUSING,
        permissions: []
      });

      expect(wrapper.find('[type="submit"]').exists()).toBe(false);
    });

    it('is hidden when a permission exists for a different initiative', () => {
      const { wrapper } = mountProjectListNavigator({
        initiative: Initiative.HOUSING,
        permissions: [{ initiative: Initiative.GENERAL, resource: PROVIDED_RESOURCE, action: Action.CREATE }]
      });

      expect(wrapper.find('[type="submit"]').exists()).toBe(false);
    });
  });

  describe('pagination from query string', () => {
    it('reads rows/sort/page from the query string while on the projects tab', () => {
      mockUseRoute.mockReturnValue({
        query: { tab: '0', rows: '20', order: '1', field: 'projectName', page: '2' }
      });

      const { wrapper } = mountProjectListNavigator();
      const dataTable = wrapper.findComponent(DataTable);

      expect(dataTable.props('rows')).toBe(20);
      expect(dataTable.props('sortField')).toBe('projectName');
      expect(dataTable.props('sortOrder')).toBe(1);
    });

    it('falls back to defaults when on a non-projects tab (e.g. enquiries)', () => {
      mockUseRoute.mockReturnValue({
        query: { tab: '1', rows: '20', order: '1', field: 'projectName', page: '2' }
      });

      const { wrapper } = mountProjectListNavigator();
      const dataTable = wrapper.findComponent(DataTable);

      // Defaults from `pagination` ref's initial value, not the query string,
      // since `tab` is not '0'/unset.
      expect(dataTable.props('rows')).toBe(10);
      expect(dataTable.props('sortField')).toBe('submittedAt');
      expect(dataTable.props('sortOrder')).toBe(-1);
    });
  });
});
