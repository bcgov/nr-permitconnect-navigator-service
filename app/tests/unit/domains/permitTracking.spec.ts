import { mockReset } from 'vitest-mock-extended';

import { TEST_PERMIT_TRACKING_1 } from '../data/index.ts';
import { mockRepos } from '../../__mocks__/unitOfWorkMock.ts';
import { upsertPermitTracking } from '../../../src/domains/permitTracking.ts';

import type { PermitTrackingBase } from '../../../src/types/index.ts';

describe('permitTracking domain', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReset(mockRepos);
  });

  describe('upsertPermitTracking', () => {
    it('should create new permit tracking when permitTrackingId is not provided', async () => {
      const trackingData: PermitTrackingBase = {
        ...TEST_PERMIT_TRACKING_1,
        permitTrackingId: undefined
      } as never;

      mockRepos.permitTracking.create.mockResolvedValue({
        ...trackingData,
        permitTrackingId: 1
      });

      const result = await upsertPermitTracking(mockRepos, trackingData);

      expect(mockRepos.permitTracking.create).toHaveBeenCalledWith(trackingData);
      expect(result.permitId).toBe('permit-123');
      expect(result.trackingId).toBe('TRK-001');
    });

    it('should update permit tracking when permitTrackingId is provided', async () => {
      const trackingData: PermitTrackingBase = {
        ...TEST_PERMIT_TRACKING_1,
        trackingId: 'TRK-001-UPDATED',
        shownToProponent: false
      };

      mockRepos.permitTracking.update.mockResolvedValue(trackingData as never);

      const result = await upsertPermitTracking(mockRepos, trackingData);

      expect(mockRepos.permitTracking.update).toHaveBeenCalledWith(
        { permitTrackingId: trackingData.permitTrackingId },
        trackingData
      );
      expect(result.trackingId).toBe('TRK-001-UPDATED');
      expect(result.shownToProponent).toBe(false);
    });

    it('should handle tracking data with all optional fields for create', async () => {
      const trackingData: PermitTrackingBase = {
        ...TEST_PERMIT_TRACKING_1,
        permitTrackingId: undefined,
        permitId: 'permit-456',
        trackingId: 'TRK-002',
        sourceSystemKindId: 2
      } as never;

      mockRepos.permitTracking.create.mockResolvedValue({
        ...trackingData,
        permitTrackingId: 2,
        createdAt: new Date(),
        createdBy: 'user-123'
      } as never);

      const result = await upsertPermitTracking(mockRepos, trackingData);

      expect(mockRepos.permitTracking.create).toHaveBeenCalledWith(trackingData);
      expect(result.permitTrackingId).toBe(2);
      expect(result.createdBy).toBe('user-123');
    });

    it('should handle tracking data with all optional fields for update', async () => {
      const trackingData: PermitTrackingBase = {
        ...TEST_PERMIT_TRACKING_1,
        permitTrackingId: 3,
        permitId: 'permit-789',
        trackingId: 'TRK-003-REVISED',
        sourceSystemKindId: 3
      };

      mockRepos.permitTracking.update.mockResolvedValue({
        ...trackingData,
        updatedAt: new Date(),
        updatedBy: 'user-456'
      } as never);

      const result = await upsertPermitTracking(mockRepos, trackingData);

      expect(mockRepos.permitTracking.update).toHaveBeenCalledWith({ permitTrackingId: 3 }, trackingData);
      expect(result.updatedBy).toBe('user-456');
    });
  });
});
