import { TEST_PERMIT_1 } from '../data/index.ts';
import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import * as permitTrackingService from '../../../src/services/permitTracking.ts';

import type { PermitTracking } from '../../../src/types/index.ts';

describe('deleteManyPermitTracking', () => {
  it('calls permit_tracking.deleteMany', async () => {
    const FAKE_PERMIT = {
      ...TEST_PERMIT_1,
      permitTracking: [
        {
          permitTrackingId: 1,
          permitId: TEST_PERMIT_1.permitId
        }
      ] as PermitTracking[]
    };

    prismaTxMock.permit_tracking.deleteMany.mockResolvedValueOnce({ count: 1 });

    await permitTrackingService.deleteManyPermitTracking(prismaTxMock, FAKE_PERMIT);

    expect(prismaTxMock.permit_tracking.deleteMany).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.permit_tracking.deleteMany).toHaveBeenCalledWith({
      where: {
        permitId: FAKE_PERMIT.permitId,
        permitTrackingId: {
          notIn: FAKE_PERMIT.permitTracking?.map((x: PermitTracking) => x.permitTrackingId).filter((x) => x)
        }
      }
    });
  });
});

describe('upsertPermitTracking', () => {
  it('calls permit_tracking.upsert with correct data and returns result', async () => {
    prismaTxMock.permit_tracking.update.mockResolvedValueOnce({
      permitTrackingId: 1,
      permitId: TEST_PERMIT_1.permitId
    } as PermitTracking);
    prismaTxMock.permit_tracking.create.mockResolvedValueOnce({
      permitTrackingId: 2,
      permitId: TEST_PERMIT_1.permitId
    } as PermitTracking);

    const response = await permitTrackingService.upsertPermitTracking(prismaTxMock, {
      ...TEST_PERMIT_1,
      permitTracking: [
        {
          permitTrackingId: 1
        } as PermitTracking,
        {} as PermitTracking
      ]
    });

    expect(prismaTxMock.permit_tracking.create).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.permit_tracking.create).toHaveBeenCalledWith({
      data: {
        permitId: TEST_PERMIT_1.permitId
      }
    });
    expect(prismaTxMock.permit_tracking.update).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.permit_tracking.update).toHaveBeenCalledWith({
      data: {
        permitTrackingId: 1,
        permitId: TEST_PERMIT_1.permitId
      },
      where: {
        permitTrackingId: 1
      }
    });
    expect(response).toStrictEqual([
      {
        permitTrackingId: 1,
        permitId: TEST_PERMIT_1.permitId
      },
      {
        permitTrackingId: 2,
        permitId: TEST_PERMIT_1.permitId
      }
    ]);
  });
});
