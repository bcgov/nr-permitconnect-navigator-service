import { TEST_PEACH_SUMMARY, TEST_PERMIT_1, TEST_PERMIT_2 } from '#tests/unit/data/index';
import { prismaTxMock } from '#tests/__mocks__/prismaMock';
import { mockRepos } from '#tests/__mocks__/unitOfWorkMock';
import { unitOfWork } from '#src/db/unitOfWork';
import * as peachDomain from '#src/domains/peach';
import * as permitDomain from '#src/domains/permit';
import * as chesExternal from '#src/external/ches';
import * as peachExternal from '#src/external/peach';
import * as peachParser from '#src/parsers/peach';
import * as peachService from '#src/services/peach';
import { PeachIntegratedSystem } from '#src/utils/enums/permit';
import Problem from '#src/utils/problem';

import type { PermitTracking } from '#types';

vi.mock('config', async () => {
  const actual = await vi.importActual<{ get: (k: string) => unknown; has: (k: string) => boolean }>('config');
  return {
    default: {
      ...actual,
      get: vi.fn((key: string) => {
        if (key === 'server.env') return 'ci';
        if (key === 'server.pcns.appUrl') return 'www.example.com';
        if (key === 'server.pcbcUrl') return 'www.example.com';

        return actual.get(key);
      }),
      has: vi.fn(() => false)
    }
  };
});

const findPriorityPermitTrackingSpy = vi.spyOn(peachDomain, 'findPriorityPermitTracking');
const getPiesRecordSpy = vi.spyOn(peachExternal, 'getPiesRecord');
const summarizePiesRecordSpy = vi.spyOn(peachParser, 'summarizePiesRecord');
const getPeachTrackingRecordsSpy = vi.spyOn(peachDomain, 'getPeachTrackingRecords');
const fetchPeachRecordsSpy = vi.spyOn(peachDomain, 'fetchPeachRecords');
const applyPeachUpdatesSpy = vi.spyOn(peachDomain, 'applyPeachUpdates');
const prepareNotificationEmailsSpy = vi.spyOn(permitDomain, 'prepareNotificationEmails');
const emailSpy = vi.spyOn(chesExternal, 'email');

// Tracks whether a db transaction is open, external calls must only happen outside of one
let inTransaction = false;

describe('peach service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    inTransaction = false;
    vi.mocked(unitOfWork.execute).mockImplementation(async (fn) => {
      inTransaction = true;
      try {
        return await fn(mockRepos as never, prismaTxMock as never);
      } finally {
        inTransaction = false;
      }
    });
  });

  describe('getPeachSummaryService', () => {
    it('throws 422 if no priority permit tracking is found', async () => {
      findPriorityPermitTrackingSpy.mockReturnValueOnce(undefined);

      await expect(peachService.getPeachSummaryService([])).rejects.toThrow(
        new Problem(422, { detail: 'No PEACH-integrated tracking ID and/or system were found in the request body.' })
      );
    });

    it('throws 422 if tracking ID is missing', async () => {
      const invalidTracking = {
        sourceSystemKind: { sourceSystem: 'VFCBC' }
      } as PermitTracking;
      findPriorityPermitTrackingSpy.mockReturnValueOnce(invalidTracking);

      await expect(peachService.getPeachSummaryService([invalidTracking])).rejects.toThrow(
        new Problem(422, { detail: 'No PEACH-integrated tracking ID and/or system were found in the request body.' })
      );
    });

    it('throws 422 if source system is missing', async () => {
      const invalidTracking = {
        trackingId: 'TRACK-123',
        sourceSystemKind: {}
      } as PermitTracking;
      findPriorityPermitTrackingSpy.mockReturnValueOnce(invalidTracking);

      await expect(peachService.getPeachSummaryService([invalidTracking])).rejects.toThrow(
        new Problem(422, { detail: 'No PEACH-integrated tracking ID and/or system were found in the request body.' })
      );
    });

    it('throws 500 if PEACH summary cannot be derived from fetched PEACH data', async () => {
      const validTracking = {
        trackingId: 'TRACK-123',
        sourceSystemKind: { sourceSystem: 'VFCBC' }
      } as PermitTracking;

      findPriorityPermitTrackingSpy.mockReturnValueOnce(validTracking);
      getPiesRecordSpy.mockResolvedValueOnce({} as never);
      summarizePiesRecordSpy.mockReturnValueOnce(undefined as never);

      await expect(peachService.getPeachSummaryService([validTracking])).rejects.toThrow(
        new Problem(500, { detail: 'No status data could be derived from the PEACH record that was found.' })
      );
    });

    it('returns PEACH summary on success', async () => {
      const validTracking = {
        trackingId: 'TRACK-123',
        sourceSystemKind: { sourceSystem: 'VFCBC' }
      } as PermitTracking;
      const mockSummary = { status: 'APPROVED' };

      findPriorityPermitTrackingSpy.mockReturnValueOnce(validTracking);
      getPiesRecordSpy.mockResolvedValueOnce({} as never);
      summarizePiesRecordSpy.mockReturnValueOnce(mockSummary as never);

      const result = await peachService.getPeachSummaryService([validTracking]);

      expect(getPiesRecordSpy).toHaveBeenCalledWith('TRACK-123', 'VFCBC');
      expect(result).toStrictEqual(mockSummary);
    });
  });

  describe('syncPeachRecordsService', () => {
    const trackingRecords = [{ recordId: 'REC-1', systemId: PeachIntegratedSystem.VFCBC, permit: TEST_PERMIT_1 }];
    const parsedRecords = { [PeachIntegratedSystem.VFCBC + 'REC-1']: TEST_PEACH_SUMMARY };
    const updated = [
      { permit: TEST_PERMIT_1, note: 'Note 1' },
      { permit: TEST_PERMIT_2, note: 'Note 2' }
    ];
    const email1 = { to: ['one@example.com'] };
    const email2 = { to: ['two@example.com'] };

    it('reads in one trx, applies+prepares in a second, fetching PEACH outside both', async () => {
      let fetchedInTransaction: boolean | undefined;

      getPeachTrackingRecordsSpy.mockResolvedValueOnce(trackingRecords as never);
      fetchPeachRecordsSpy.mockImplementationOnce(async () => {
        fetchedInTransaction = inTransaction;
        return parsedRecords as never;
      });
      applyPeachUpdatesSpy.mockResolvedValueOnce(updated as never);
      prepareNotificationEmailsSpy.mockResolvedValueOnce([email1] as never).mockResolvedValueOnce([email2] as never);

      const result = await peachService.syncPeachRecordsService();

      expect(unitOfWork.execute).toHaveBeenCalledTimes(2);
      expect(getPeachTrackingRecordsSpy).toHaveBeenCalledWith({ permit: mockRepos.permit });
      expect(fetchPeachRecordsSpy).toHaveBeenCalledWith(trackingRecords);
      expect(fetchedInTransaction).toBe(false);
      expect(applyPeachUpdatesSpy).toHaveBeenCalledWith({ permit: mockRepos.permit }, trackingRecords, parsedRecords);
      expect(prepareNotificationEmailsSpy).toHaveBeenNthCalledWith(1, mockRepos, TEST_PERMIT_1, true, 'Note 1');
      expect(prepareNotificationEmailsSpy).toHaveBeenNthCalledWith(2, mockRepos, TEST_PERMIT_2, true, 'Note 2');
      expect(result).toEqual([email1, email2]);
    });

    it('rejects without fetching or applying when reading tracking records fails', async () => {
      getPeachTrackingRecordsSpy.mockRejectedValueOnce(new Error('db down'));

      await expect(peachService.syncPeachRecordsService()).rejects.toThrow('db down');
      expect(fetchPeachRecordsSpy).not.toHaveBeenCalled();
      expect(applyPeachUpdatesSpy).not.toHaveBeenCalled();
    });

    it('rejects, preparing no emails, when one permit fails to prepare its notification', async () => {
      getPeachTrackingRecordsSpy.mockResolvedValueOnce(trackingRecords as never);
      fetchPeachRecordsSpy.mockResolvedValueOnce(parsedRecords as never);
      applyPeachUpdatesSpy.mockResolvedValueOnce(updated as never);
      prepareNotificationEmailsSpy
        .mockResolvedValueOnce([email1] as never)
        .mockRejectedValueOnce(new Error('Invalid permit.state'));

      // Permit updates and their notes are prepared in the same transaction, so one failing rolls back the batch
      await expect(peachService.syncPeachRecordsService()).rejects.toThrow('Invalid permit.state');
    });
  });

  describe('sendPeachNotificationsService', () => {
    const email1 = { to: ['one@example.com'] };
    const email2 = { to: ['two@example.com'] };

    it('sends each email without opening a db transaction', async () => {
      emailSpy.mockResolvedValue({} as never);

      await peachService.sendPeachNotificationsService([email1, email2] as never);

      expect(emailSpy).toHaveBeenCalledWith(email1);
      expect(emailSpy).toHaveBeenCalledWith(email2);
      expect(unitOfWork.execute).not.toHaveBeenCalled();
    });

    it('sends at most 5 emails at a time', async () => {
      const emails = Array.from({ length: 12 }, (_, i) => ({ to: [`${i}@example.com`] }));
      let active = 0;
      let maxActive = 0;

      emailSpy.mockImplementation(async () => {
        maxActive = Math.max(maxActive, ++active);
        await new Promise((resolve) => setTimeout(resolve, 0));
        active--;
        return {} as never;
      });

      await peachService.sendPeachNotificationsService(emails as never);

      expect(emailSpy).toHaveBeenCalledTimes(12);
      expect(maxActive).toBe(5);
    });

    it('still sends every remaining email when one fails', async () => {
      // More than the limit of 5, so later sends only start once earlier ones have settled
      const emails = Array.from({ length: 7 }, (_, i) => ({ to: [`${i}@example.com`], subject: `Update ${i}` }));

      emailSpy.mockRejectedValueOnce(new Error('Unable to start a transaction in the given time'));
      emailSpy.mockResolvedValue({} as never);

      await expect(peachService.sendPeachNotificationsService(emails as never)).resolves.toBeUndefined();

      expect(emailSpy).toHaveBeenCalledTimes(7);
    });
  });
});
