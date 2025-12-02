import { prismaTxMock } from '../../__mocks__/prismaMock';

import { TEST_PERMIT_1 } from '../data';
import * as permitService from '../../../src/services/permit';
import { Initiative } from '../../../src/utils/enums/application';

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
      permitTypeInitiativeXref: [{ permitType: 'ABC' }]
    } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

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
    expect(response).toStrictEqual(['ABC']);
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
