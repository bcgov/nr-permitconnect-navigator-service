import { TEST_PERMIT_1 } from '../data/index.ts';
import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import * as permitService from '../../../src/services/permit.ts';
import { Initiative } from '../../../src/utils/enums/application.ts';

describe('deletePermit', () => {
  it('calls permit.delete', async () => {
    prismaTxMock.permit.update.mockResolvedValueOnce(TEST_PERMIT_1);

    await permitService.deletePermit(prismaTxMock, '1');

    expect(prismaTxMock.permit.delete).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.permit.delete).toHaveBeenCalledWith({
      where: {
        permitId: '1'
      },
      include: {
        permitType: true
      }
    });
  });
});

describe('getPermit', () => {
  it('calls permit.findFirstOrThrow and returns result', async () => {
    prismaTxMock.permit.findFirstOrThrow.mockResolvedValueOnce(TEST_PERMIT_1);

    const response = await permitService.getPermit(prismaTxMock, '1');

    expect(prismaTxMock.permit.findFirstOrThrow).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.permit.findFirstOrThrow).toHaveBeenCalledWith({
      where: {
        permitId: '1'
      },
      include: {
        permitType: true,
        permitNote: { orderBy: { createdAt: 'desc' } },
        permitTracking: { include: { sourceSystemKind: true } }
      }
    });
    expect(response).toStrictEqual(TEST_PERMIT_1);
  });
});

describe('getPermitTypes', () => {
  it('calls initiative.findFirstOrThrow and returns result', async () => {
    prismaTxMock.initiative.findFirstOrThrow.mockResolvedValueOnce({
      // @ts-expect-error Jest doesn't play nicely with Prisma includes
      permitTypeInitiativeXref: [{ permitType: { permitTypeId: 'ABC' } }]
    });

    const response = await permitService.getPermitTypes(prismaTxMock, Initiative.HOUSING);

    expect(prismaTxMock.initiative.findFirstOrThrow).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.initiative.findFirstOrThrow).toHaveBeenCalledWith({
      where: {
        code: Initiative.HOUSING
      },
      include: {
        permitTypeInitiativeXref: {
          include: {
            permitType: true
          },
          orderBy: [
            {
              permitType: {
                businessDomain: 'asc'
              }
            },
            {
              permitType: {
                name: 'asc'
              }
            }
          ]
        }
      }
    });
    expect(response).toStrictEqual([{ permitType: { permitTypeId: 'ABC' } }]);
  });
});

describe('listPermits', () => {
  it('calls permit.findMany and returns result', async () => {
    prismaTxMock.permit.findMany.mockResolvedValueOnce([TEST_PERMIT_1]);

    const response = await permitService.listPermits(prismaTxMock, {});

    expect(prismaTxMock.permit.findMany).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.permit.findMany).toHaveBeenCalledWith({
      where: {
        activityId: undefined
      },
      orderBy: {
        permitType: {
          name: 'asc'
        }
      },
      include: {
        permitType: true,
        permitNote: false,
        permitTracking: {
          include: {
            sourceSystemKind: true
          }
        }
      }
    });
    expect(response).toStrictEqual([TEST_PERMIT_1]);
  });
});

describe('searchPermits', () => {
  it('calls permit.findMany with no filters or includes and returns result', async () => {
    prismaTxMock.permit.findMany.mockResolvedValueOnce([TEST_PERMIT_1]);

    const response = await permitService.searchPermits(prismaTxMock, {});

    expect(prismaTxMock.permit.findMany).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.permit.findMany).toHaveBeenCalledWith({
      where: {
        AND: [{}, {}, {}, {}, {}, {}, {}]
      },
      include: {}
    });
    expect(response).toStrictEqual([TEST_PERMIT_1]);
  });

  it('calls permit.findMany with full filters and integrated tracking and returns result', async () => {
    prismaTxMock.permit.findMany.mockResolvedValueOnce([TEST_PERMIT_1]);

    const params = {
      permitId: ['PERMIT-1'],
      activityId: ['ACTIVITY-1'],
      permitTypeId: [123],
      stage: ['Technical review'],
      state: ['In progress'],
      sourceSystems: ['ITSM-6072'],
      includePermitNotes: true,
      includePermitTracking: true,
      includePermitType: true,
      onlyPeachIntegratedTrackings: true
    };

    const response = await permitService.searchPermits(prismaTxMock, params);

    expect(prismaTxMock.permit.findMany).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.permit.findMany).toHaveBeenCalledWith({
      where: {
        AND: [
          { permitId: { in: ['PERMIT-1'] } },
          { activityId: { in: ['ACTIVITY-1'] } },
          { permitTypeId: { in: [123] } },
          { stage: { in: ['Technical review'] } },
          { state: { in: ['In progress'] } },
          { permitType: { sourceSystem: { in: ['ITSM-6072'] } } },
          {
            permitTracking: {
              some: {
                sourceSystemKind: {
                  integrated: true
                }
              }
            }
          }
        ]
      },
      include: {
        permitType: true,
        permitNote: true,
        permitTracking: {
          where: {
            AND: [
              {
                sourceSystemKind: {
                  sourceSystem: {
                    in: ['ITSM-6072']
                  }
                }
              },
              {
                sourceSystemKind: {
                  integrated: true
                }
              }
            ]
          },
          include: { sourceSystemKind: true }
        }
      }
    });
    expect(response).toStrictEqual([TEST_PERMIT_1]);
  });

  it('calls permit.findMany with includePermitTracking but no filters and returns result', async () => {
    prismaTxMock.permit.findMany.mockResolvedValueOnce([TEST_PERMIT_1]);

    const params = {
      includePermitTracking: true
    };

    const response = await permitService.searchPermits(prismaTxMock, params);

    expect(prismaTxMock.permit.findMany).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.permit.findMany).toHaveBeenCalledWith({
      where: {
        AND: [{}, {}, {}, {}, {}, {}, {}]
      },
      include: {
        permitTracking: {
          include: {
            sourceSystemKind: true
          }
        }
      }
    });
    expect(response).toStrictEqual([TEST_PERMIT_1]);
  });
});

describe('upsertPermit', () => {
  it('calls permit.upsert with correct data and returns result', async () => {
    prismaTxMock.permit.upsert.mockResolvedValueOnce(TEST_PERMIT_1);

    const response = await permitService.upsertPermit(prismaTxMock, TEST_PERMIT_1);

    expect(prismaTxMock.permit.upsert).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.permit.upsert).toHaveBeenCalledWith({
      update: TEST_PERMIT_1,
      create: TEST_PERMIT_1,
      where: { permitId: TEST_PERMIT_1.permitId },
      include: {
        permitType: true
      }
    });
    expect(response).toStrictEqual(TEST_PERMIT_1);
  });
});
