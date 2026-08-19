import { TEST_PERMIT_1 } from '#tests/unit/data/index';
import { prismaTxMock } from '#tests/__mocks__/prismaMock';
import { PermitRepository } from '#src/repositories/permit';
import { Initiative } from '#src/utils/enums/application';

// Test data for the permit select shape that comes back from findMany
const TEST_PERMIT_SELECT_1 = {
  permitId: TEST_PERMIT_1.permitId,
  activityId: TEST_PERMIT_1.activityId,
  permitTypeId: TEST_PERMIT_1.permitTypeId,
  decisionDate: TEST_PERMIT_1.decisionDate,
  stage: TEST_PERMIT_1.stage,
  state: TEST_PERMIT_1.state,
  statusLastChanged: TEST_PERMIT_1.statusLastChanged,
  submittedDate: TEST_PERMIT_1.submittedDate,
  permitType: {
    businessDomain: 'DOMAIN',
    name: 'PERMIT1'
  },
  activity: {
    electrificationProject: {
      projectId: 'proj-1',
      projectName: 'Test Project',
      companyNameRegistered: 'COMPANY'
    },
    generalProject: null,
    housingProject: null
  }
} as any; // eslint-disable-line @typescript-eslint/no-explicit-any

// Construct the real repo — its constructor picks tx.permit, so prismaTxMock.permit
// acts as the deep-mocked delegate. prismaMock setup resets it before each test.
const makeRepo = () => new PermitRepository(prismaTxMock, 'principal-id');

describe('PermitRepository', () => {
  describe('search', () => {
    it('builds basic where clause with initiative-specific project table for ELECTRIFICATION', async () => {
      prismaTxMock.permit.count.mockResolvedValueOnce(1);
      prismaTxMock.permit.findMany.mockResolvedValueOnce([TEST_PERMIT_SELECT_1]);

      const options = { skip: '0', take: '10' };
      await makeRepo().search(Initiative.ELECTRIFICATION, options);

      expect(prismaTxMock.permit.findMany).toHaveBeenCalledTimes(1);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const callArgs = prismaTxMock.permit.findMany.mock.calls[0][0] as any;

      // Verify the project table is set to electrificationProject
      expect(callArgs.where.AND[0]).toEqual({
        activity: {
          electrificationProject: { isNot: null }
        }
      });
    });

    it('builds basic where clause with initiative-specific project table for HOUSING', async () => {
      prismaTxMock.permit.count.mockResolvedValueOnce(1);
      prismaTxMock.permit.findMany.mockResolvedValueOnce([TEST_PERMIT_SELECT_1]);

      const options = { skip: '0', take: '10' };
      await makeRepo().search(Initiative.HOUSING, options);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const callArgs = prismaTxMock.permit.findMany.mock.calls[0][0] as any;

      // Verify the project table is set to housingProject
      expect(callArgs.where.AND[0]).toEqual({
        activity: {
          housingProject: { isNot: null }
        }
      });
    });

    it('builds basic where clause with initiative-specific project table for GENERAL', async () => {
      prismaTxMock.permit.count.mockResolvedValueOnce(1);
      prismaTxMock.permit.findMany.mockResolvedValueOnce([TEST_PERMIT_SELECT_1]);

      const options = { skip: '0', take: '10' };
      await makeRepo().search(Initiative.GENERAL, options);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const callArgs = prismaTxMock.permit.findMany.mock.calls[0][0] as any;

      // Verify the project table is set to generalProject
      expect(callArgs.where.AND[0]).toEqual({
        activity: {
          generalProject: { isNot: null }
        }
      });
    });

    it('includes date range filter when dateRange is provided', async () => {
      prismaTxMock.permit.count.mockResolvedValueOnce(1);
      prismaTxMock.permit.findMany.mockResolvedValueOnce([TEST_PERMIT_SELECT_1]);

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      const options = { skip: '0', take: '10', dateRange: [startDate, endDate] } as never;

      await makeRepo().search(Initiative.HOUSING, options);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const callArgs = prismaTxMock.permit.findMany.mock.calls[0][0] as any;
      const dateFilter = (callArgs.where.AND as Record<string, unknown>[]).find(
        (clause: Record<string, unknown>) => 'OR' in clause && Array.isArray((clause as Record<string, unknown>).OR)
      );

      expect(dateFilter).toEqual({
        OR: [
          { submittedDate: { gte: startDate, lte: endDate } },
          { decisionDate: { gte: startDate, lte: endDate } },
          { statusLastChanged: { gte: startDate, lte: endDate } }
        ]
      });
    });

    it('includes permitTypeId filter when permitTypeId is provided', async () => {
      prismaTxMock.permit.count.mockResolvedValueOnce(1);
      prismaTxMock.permit.findMany.mockResolvedValueOnce([TEST_PERMIT_SELECT_1]);

      const options = { skip: '0', take: '10', permitTypeId: '42' };
      await makeRepo().search(Initiative.HOUSING, options);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const callArgs = prismaTxMock.permit.findMany.mock.calls[0][0] as any;
      const permitTypeFilter = (callArgs.where.AND as Record<string, unknown>[]).find(
        (clause) => 'permitTypeId' in clause
      );

      expect(permitTypeFilter).toEqual({ permitTypeId: 42 });
    });

    it('includes sourceSystemKindId filter when sourceSystemKindId is provided', async () => {
      prismaTxMock.permit.count.mockResolvedValueOnce(1);
      prismaTxMock.permit.findMany.mockResolvedValueOnce([TEST_PERMIT_SELECT_1]);

      const options = { skip: '0', take: '10', sourceSystemKindId: '99' };
      await makeRepo().search(Initiative.HOUSING, options);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const callArgs = prismaTxMock.permit.findMany.mock.calls[0][0] as any;
      const sourceSystemFilter = (callArgs.where.AND as Record<string, unknown>[]).find(
        (clause) => 'permitTracking' in clause
      );

      expect(sourceSystemFilter).toEqual({
        permitTracking: {
          some: {
            sourceSystemKindId: 99
          }
        }
      });
    });

    it('includes search tag filter for all text fields when searchTag is provided', async () => {
      prismaTxMock.permit.count.mockResolvedValueOnce(1);
      prismaTxMock.permit.findMany.mockResolvedValueOnce([TEST_PERMIT_SELECT_1]);

      const options = { skip: '0', take: '10', searchTag: 'test' };
      await makeRepo().search(Initiative.HOUSING, options);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const callArgs = prismaTxMock.permit.findMany.mock.calls[0][0] as any;
      const searchFilter = (callArgs.where.AND as Record<string, unknown>[]).find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (clause: Record<string, unknown>) => 'OR' in clause && (clause as any).OR?.[0]?.activityId
      );

      expect(searchFilter).toBeDefined();
      expect(searchFilter).toEqual(
        expect.objectContaining({
          OR: expect.arrayContaining([
            { activityId: { contains: 'test', mode: 'insensitive' } },
            { stage: { contains: 'test', mode: 'insensitive' } },
            { state: { contains: 'test', mode: 'insensitive' } }
          ])
        })
      );
    });

    it('applies sort order ASC when sortField is valid and sortOrder is 1', async () => {
      prismaTxMock.permit.count.mockResolvedValueOnce(1);
      prismaTxMock.permit.findMany.mockResolvedValueOnce([TEST_PERMIT_SELECT_1]);

      const options = { skip: '0', take: '10', sortField: 'stage', sortOrder: '1' };
      await makeRepo().search(Initiative.HOUSING, options);

      const callArgs = prismaTxMock.permit.findMany.mock.calls[0][0];
      expect(callArgs?.orderBy).toEqual({ stage: 'asc' });
    });

    it('applies sort order DESC when sortField is valid and sortOrder is not 1', async () => {
      prismaTxMock.permit.count.mockResolvedValueOnce(1);
      prismaTxMock.permit.findMany.mockResolvedValueOnce([TEST_PERMIT_SELECT_1]);

      const options = { skip: '0', take: '10', sortField: 'stage', sortOrder: '2' };
      await makeRepo().search(Initiative.HOUSING, options);

      const callArgs = prismaTxMock.permit.findMany.mock.calls[0][0];
      expect(callArgs?.orderBy).toEqual({ stage: 'desc' });
    });

    it('ignores sort when sortOrder is 0', async () => {
      prismaTxMock.permit.count.mockResolvedValueOnce(1);
      prismaTxMock.permit.findMany.mockResolvedValueOnce([TEST_PERMIT_SELECT_1]);

      const options = { skip: '0', take: '10', sortField: 'stage', sortOrder: '0' };
      await makeRepo().search(Initiative.HOUSING, options);

      const callArgs = prismaTxMock.permit.findMany.mock.calls[0][0];
      expect(callArgs?.orderBy).toBeUndefined();
    });

    it('ignores sort when sortField is not in validSortFields', async () => {
      prismaTxMock.permit.count.mockResolvedValueOnce(1);
      prismaTxMock.permit.findMany.mockResolvedValueOnce([TEST_PERMIT_SELECT_1]);

      const options = { skip: '0', take: '10', sortField: 'invalidField', sortOrder: '1' };
      await makeRepo().search(Initiative.HOUSING, options);

      const callArgs = prismaTxMock.permit.findMany.mock.calls[0][0];
      expect(callArgs?.orderBy).toBeUndefined();
    });

    it('applies pagination with skip and take', async () => {
      prismaTxMock.permit.count.mockResolvedValueOnce(10);
      prismaTxMock.permit.findMany.mockResolvedValueOnce([TEST_PERMIT_SELECT_1]);

      const options = { skip: '20', take: '5' };
      await makeRepo().search(Initiative.HOUSING, options);

      const callArgs = prismaTxMock.permit.findMany.mock.calls[0][0];
      expect(callArgs?.skip).toBe(20);
      expect(callArgs?.take).toBe(5);
    });

    it('applies default pagination when skip and take are not provided', async () => {
      prismaTxMock.permit.count.mockResolvedValueOnce(10);
      prismaTxMock.permit.findMany.mockResolvedValueOnce([TEST_PERMIT_SELECT_1]);

      const options = {};
      await makeRepo().search(Initiative.HOUSING, options);

      const callArgs = prismaTxMock.permit.findMany.mock.calls[0][0];
      expect(callArgs?.skip).toBe(0);
      expect(callArgs?.take).toBe(10);
    });

    it('returns transformed permits with project alias and total count', async () => {
      prismaTxMock.permit.count.mockResolvedValueOnce(5);
      prismaTxMock.permit.findMany.mockResolvedValueOnce([TEST_PERMIT_SELECT_1]);

      const options = { skip: '0', take: '10' };
      const result = await makeRepo().search(Initiative.HOUSING, options);

      expect(result.totalRecords).toBe(5);
      expect(result.permits).toHaveLength(1);
      expect(result.permits[0]).toEqual(
        expect.objectContaining({
          permitId: TEST_PERMIT_SELECT_1.permitId,
          project: TEST_PERMIT_SELECT_1.activity.electrificationProject
        })
      );
    });
  });

  it('includes search tag filter without location fields for ELECTRIFICATION initiative', async () => {
    prismaTxMock.permit.count.mockResolvedValueOnce(1);
    prismaTxMock.permit.findMany.mockResolvedValueOnce([TEST_PERMIT_SELECT_1]);

    const options = { skip: '0', take: '10', searchTag: 'test' };
    await makeRepo().search(Initiative.ELECTRIFICATION, options);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const callArgs = prismaTxMock.permit.findMany.mock.calls[0][0] as any;
    const searchFilter = (callArgs.where.AND as Record<string, unknown>[]).find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (clause: Record<string, unknown>) => 'OR' in clause && (clause as any).OR?.[0]?.activityId
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const projectFilter = (searchFilter as any).OR.find((cond: any) => cond.activity?.electrificationProject);

    expect(projectFilter.activity.electrificationProject.OR).toEqual([
      { projectName: { contains: 'test', mode: 'insensitive' } },
      { companyNameRegistered: { contains: 'test', mode: 'insensitive' } }
    ]);
  });
});
