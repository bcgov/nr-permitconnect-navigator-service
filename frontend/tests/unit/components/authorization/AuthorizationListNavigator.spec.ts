import { ref } from 'vue';

import AuthorizationListNavigator from '@/components/authorization/AuthorizationListNavigator.vue';
import { Column, DataTable } from '@/lib/primevue';
import { permitService, sourceSystemKindService } from '@/services';
import { Initiative, RouteName } from '@/utils/enums/application';
import { projectAuthorizationRouteNameKey } from '@/utils/keys';

import { mountComponent } from '../../../mountComponent';

import type { SearchPermitsResponse, SourceSystemKind } from '@/types';

// Fixtures

const testPermit: SearchPermitsResponse['permits'][number] = {
  permitId: 'permit-1',
  activityId: 'activity-1',
  permitTypeId: 26,
  decisionDate: '2024-01-15',
  stage: 'SUBMISSION',
  state: 'IN_PROGRESS',
  statusLastChanged: '2024-01-10',
  submittedDate: '2024-01-01',
  permitType: { businessDomain: 'Water', name: 'Water Licence' },
  project: {
    projectId: 'project-1',
    projectName: 'Test Project',
    companyNameRegistered: 'Test Co',
    streetAddress: '123 Main St',
    locality: 'Victoria',
    province: 'BC'
  }
};

const testSearchResponse: SearchPermitsResponse = { permits: [testPermit], totalRecords: 1 };

const sampleSourceSystemKind: SourceSystemKind = {
  description: 'ATS Project Number',
  kind: undefined,
  sourceSystem: 'ITSM-5314',
  sourceSystemKindId: 2,
  integrated: false,
  createdAt: '2025-06-18T15:56:00.515Z',
  createdBy: 'test',
  permitTypeIds: [26]
};

// Mount

const searchPermitsSpy = vi.spyOn(permitService, 'searchPermits');
const listSourceSystemKindsSpy = vi.spyOn(sourceSystemKindService, 'listSourceSystemKinds');

function mountAuthorizationListNavigator(options: { initiative?: Initiative } = {}) {
  const { initiative } = options;

  const { wrapper } = mountComponent(AuthorizationListNavigator, {
    piniaState: {
      ...(initiative === undefined ? {} : { app: { initiative } }),
      code: {
        codes: {
          PermitState: [{ code: 'IN_PROGRESS', display: 'In Progress', active: true }],
          PermitStage: [{ code: 'SUBMISSION', display: 'Submission', active: true }],
          SourceSystem: [{ code: 'ITSM-5314', display: 'ATS', active: true }]
        }
      }
    },
    provide: {
      [projectAuthorizationRouteNameKey as symbol]: ref(RouteName.INT_HOUSING_PROJECT_AUTHORIZATION)
    }
  });

  return { wrapper };
}

beforeEach(() => {
  vi.useFakeTimers();
  searchPermitsSpy.mockResolvedValue(testSearchResponse);
  listSourceSystemKindsSpy.mockResolvedValue([sampleSourceSystemKind]);
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

// Tests

describe('AuthorizationListNavigator', () => {
  describe('rendering', () => {
    it('mounts without error', async () => {
      const { wrapper } = mountAuthorizationListNavigator();
      await vi.advanceTimersByTimeAsync(500);

      expect(wrapper.exists()).toBe(true);
    });

    it('performs an initial search with the default pagination/sort after the debounce elapses', async () => {
      mountAuthorizationListNavigator();

      expect(searchPermitsSpy).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(500);

      expect(searchPermitsSpy).toHaveBeenCalledWith({
        dateRange: undefined,
        permitTypeId: undefined,
        sourceSystemKindId: undefined,
        searchTag: undefined,
        skip: 0,
        take: 10,
        sortField: 'submittedDate',
        sortOrder: -1
      });
    });

    it('renders a row for each permit returned by the search', async () => {
      const { wrapper } = mountAuthorizationListNavigator();
      await vi.advanceTimersByTimeAsync(500);

      expect(wrapper.text()).toContain(testPermit.project?.projectName);
      expect(wrapper.text()).toContain(testPermit.permitType.businessDomain);
    });

    it('shows the location column when the initiative is not electrification', async () => {
      const { wrapper } = mountAuthorizationListNavigator({ initiative: Initiative.HOUSING });
      await vi.advanceTimersByTimeAsync(500);

      const fields = wrapper.findAllComponents(Column).map((c) => c.props('field'));

      expect(fields).toContain('location');
    });

    it('hides the location column when the initiative is electrification', async () => {
      const { wrapper } = mountAuthorizationListNavigator({ initiative: Initiative.ELECTRIFICATION });
      await vi.advanceTimersByTimeAsync(500);

      const fields = wrapper.findAllComponents(Column).map((c) => c.props('field'));

      expect(fields).not.toContain('location');
    });
  });

  describe('search debounce', () => {
    it('debounces rapid successive searches into a single call', async () => {
      const { wrapper } = mountAuthorizationListNavigator();
      await vi.advanceTimersByTimeAsync(500);
      searchPermitsSpy.mockClear();

      const searchInput = wrapper.find('#searchTag');
      await searchInput.setValue('a');
      await vi.advanceTimersByTimeAsync(250);
      await searchInput.setValue('ab');
      await vi.advanceTimersByTimeAsync(250);
      await searchInput.setValue('abc');

      expect(searchPermitsSpy).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(500);

      expect(searchPermitsSpy).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ searchTag: 'abc' }));
    });
  });

  describe('user interaction', () => {
    it('resets to the first page and requests the new sort when a column is sorted', async () => {
      const { wrapper } = mountAuthorizationListNavigator();
      await vi.advanceTimersByTimeAsync(500);
      searchPermitsSpy.mockClear();

      await wrapper.findComponent(DataTable).vm.$emit('sort', { sortField: 'submittedDate', sortOrder: 1 });
      await vi.advanceTimersByTimeAsync(500);

      expect(searchPermitsSpy).toHaveBeenCalledWith(
        expect.objectContaining({ sortField: 'submittedDate', sortOrder: 1, skip: 0 })
      );
    });

    it('requests the correct skip/take when paginating', async () => {
      const { wrapper } = mountAuthorizationListNavigator();
      await vi.advanceTimersByTimeAsync(500);
      searchPermitsSpy.mockClear();

      await wrapper.findComponent(DataTable).vm.$emit('page', { page: 2, rows: 20 });
      await vi.advanceTimersByTimeAsync(500);

      expect(searchPermitsSpy).toHaveBeenCalledWith(expect.objectContaining({ skip: 40, take: 20 }));
    });
  });
});
