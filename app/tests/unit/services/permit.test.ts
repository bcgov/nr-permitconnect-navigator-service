import { mockReset } from 'vitest-mock-extended';

import {
  TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
  TEST_CURRENT_CONTEXT,
  TEST_PERMIT_1,
  TEST_PERMIT_TYPE_1
} from '../data/index.ts';
import { mockRepos } from '../../__mocks__/unitOfWorkMock.ts';
import { PermitStage, PermitState } from '../../../src/db/codes/enums.ts';
import * as peachDomain from '../../../src/domains/peach.ts';
import * as permitDomain from '../../../src/domains/permit.ts';
import * as permitTrackingDomain from '../../../src/domains/permitTracking.ts';
import * as externalPeach from '../../../src/external/peach.ts';
import * as peachParser from '../../../src/parsers/peach.ts';
import * as responseFiltering from '../../../src/parsers/responseFiltering.ts';
import * as permitService from '../../../src/services/permit.ts';
import { Initiative } from '../../../src/utils/enums/application.ts';
import { PermitNeeded } from '../../../src/utils/enums/permit.ts';
import Problem from '../../../src/utils/problem.ts';

import type { CurrentAuthorization, IntakePermitRequest } from '../../../src/types/index.ts';

vi.mock('config');

const sendNotificationsSpy = vi.spyOn(permitDomain, 'sendPermitUpdateNotifications');
const upsertPermitTrackingSpy = vi.spyOn(permitTrackingDomain, 'upsertPermitTracking');
const filterSpy = vi.spyOn(responseFiltering, 'filterActivityResponseByScope');
const findPriorityPermitTrackingSpy = vi.spyOn(peachDomain, 'findPriorityPermitTracking');
const getPeachRecordSpy = vi.spyOn(externalPeach, 'getPeachRecord');
const summarizePeachRecordSpy = vi.spyOn(peachParser, 'summarizePeachRecord');

describe('permit service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReset(mockRepos);
  });

  describe('deletePermitService', () => {
    it('deletes permit, permitNotes, and permitTrackings', async () => {
      mockRepos.permit.delete.mockResolvedValue({} as never);
      mockRepos.permitNote.deleteMany.mockResolvedValue({} as never);
      mockRepos.permitTracking.deleteMany.mockResolvedValue({} as never);

      await permitService.deletePermitService(TEST_PERMIT_1.permitId);

      expect(mockRepos.permit.delete).toHaveBeenCalledWith({ permitId: TEST_PERMIT_1.permitId });
      expect(mockRepos.permitNote.deleteMany).toHaveBeenCalledWith({ permitId: TEST_PERMIT_1.permitId });
      expect(mockRepos.permitTracking.deleteMany).toHaveBeenCalledWith({ permitId: TEST_PERMIT_1.permitId });
    });
  });

  describe('getPermitService', () => {
    it('fetches permit with includes', async () => {
      mockRepos.permit.findFirstOrThrow.mockResolvedValueOnce(TEST_PERMIT_1 as never);

      const response = await permitService.getPermitService(TEST_PERMIT_1.permitId);

      expect(mockRepos.permit.findFirstOrThrow).toHaveBeenCalledWith({
        where: { permitId: TEST_PERMIT_1.permitId },
        include: {
          permitType: true,
          permitNote: { orderBy: { createdAt: 'desc' } },
          permitTracking: { include: { sourceSystemKind: true } }
        }
      });
      expect(response).toStrictEqual(TEST_PERMIT_1);
    });
  });

  describe('intakePermitService', () => {
    it('creates a permit for each applied permit and tracking only for those with a trackingId', async () => {
      const intakeData: IntakePermitRequest[] = [
        {
          activityId: TEST_PERMIT_1.activityId,
          permitTypeId: TEST_PERMIT_1.permitTypeId,
          trackingId: 'REC-1',
          submittedDate: '2024-01-01'
        },
        {
          activityId: TEST_PERMIT_1.activityId,
          permitTypeId: TEST_PERMIT_1.permitTypeId
        }
      ];

      mockRepos.permit.upsert.mockResolvedValue({} as never);
      upsertPermitTrackingSpy.mockResolvedValueOnce({} as never);
      mockRepos.permit.findMany.mockResolvedValueOnce([TEST_PERMIT_1] as never);

      const response = await permitService.intakePermitService(
        TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
        TEST_CURRENT_CONTEXT,
        intakeData
      );

      expect(mockRepos.permit.upsert).toHaveBeenCalledTimes(2);
      expect(mockRepos.permit.upsert).toHaveBeenCalledWith(
        { permitId: expect.any(String) },
        expect.objectContaining({
          activityId: intakeData[0].activityId,
          permitTypeId: intakeData[0].permitTypeId,
          stage: PermitStage.APPLICATION_SUBMISSION,
          needed: PermitNeeded.YES,
          state: PermitState.IN_PROGRESS,
          submittedDate: intakeData[0].submittedDate
        }),
        expect.objectContaining({ activityId: intakeData[0].activityId })
      );

      expect(upsertPermitTrackingSpy).toHaveBeenCalledTimes(1);
      expect(upsertPermitTrackingSpy).toHaveBeenCalledWith(
        { permitTracking: mockRepos.permitTracking },
        expect.objectContaining({ trackingId: 'REC-1', permitId: expect.any(String) })
      );

      expect(mockRepos.permit.findMany).toHaveBeenCalledWith({
        where: { permitId: { in: [expect.any(String), expect.any(String)] } }
      });
      expect(response).toStrictEqual([TEST_PERMIT_1]);
    });

    it('does not create a tracking record when no trackingId is provided', async () => {
      const intakeData: IntakePermitRequest[] = [
        { activityId: TEST_PERMIT_1.activityId, permitTypeId: TEST_PERMIT_1.permitTypeId }
      ];

      mockRepos.permit.upsert.mockResolvedValueOnce({} as never);
      mockRepos.permit.findMany.mockResolvedValueOnce([] as never);

      await permitService.intakePermitService(TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR, TEST_CURRENT_CONTEXT, intakeData);

      expect(upsertPermitTrackingSpy).not.toHaveBeenCalled();
    });

    it('returns an empty array when given no permits to intake', async () => {
      mockRepos.permit.findMany.mockResolvedValueOnce([] as never);

      const response = await permitService.intakePermitService(
        TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
        TEST_CURRENT_CONTEXT,
        []
      );

      expect(mockRepos.permit.upsert).not.toHaveBeenCalled();
      expect(upsertPermitTrackingSpy).not.toHaveBeenCalled();
      expect(mockRepos.permit.findMany).toHaveBeenCalledWith({ where: { permitId: { in: [] } } });
      expect(response).toStrictEqual([]);
    });

    describe('scope:self delegate check', () => {
      const proponentAuthContext: CurrentAuthorization = {
        ...TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
        attributes: ['scope:self']
      };
      const intakeData: IntakePermitRequest[] = [
        { activityId: TEST_PERMIT_1.activityId, permitTypeId: TEST_PERMIT_1.permitTypeId }
      ];

      it('throws 403 when the scope:self user is not a delegate for one of the activities', async () => {
        mockRepos.activityContact.findMany.mockResolvedValueOnce([] as never);

        await expect(
          permitService.intakePermitService(proponentAuthContext, TEST_CURRENT_CONTEXT, intakeData)
        ).rejects.toThrow(
          new Problem(403, { detail: 'User is not a delegate for one or more activities in the permit request list' })
        );
        expect(mockRepos.permit.upsert).not.toHaveBeenCalled();
      });

      it('proceeds when the scope:self user is a delegate for every activity', async () => {
        mockRepos.activityContact.findMany.mockResolvedValueOnce([{ activityId: TEST_PERMIT_1.activityId }] as never);
        mockRepos.permit.upsert.mockResolvedValueOnce({} as never);
        mockRepos.permit.findMany.mockResolvedValueOnce([TEST_PERMIT_1] as never);

        await permitService.intakePermitService(proponentAuthContext, TEST_CURRENT_CONTEXT, intakeData);

        expect(mockRepos.activityContact.findMany).toHaveBeenCalledWith({
          where: { contact: { user: { userId: TEST_CURRENT_CONTEXT.userId } } },
          select: { activityId: true }
        });
        expect(mockRepos.permit.upsert).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('listPermitsService', () => {
    it('fetches permits and applies scope filtering', async () => {
      const mockPermits = [TEST_PERMIT_1];
      mockRepos.permit.findMany.mockResolvedValueOnce(mockPermits as never);
      filterSpy.mockResolvedValueOnce(mockPermits as never);

      const response = await permitService.listPermitsService(
        TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
        TEST_CURRENT_CONTEXT,
        { activityId: TEST_PERMIT_1.activityId }
      );

      expect(mockRepos.permit.findMany).toHaveBeenCalledWith({
        where: { activityId: TEST_PERMIT_1.activityId },
        orderBy: { permitType: { name: 'asc' } },
        include: {
          activity: { include: { activityContact: true } },
          permitType: true,
          permitNote: false,
          permitTracking: { include: { sourceSystemKind: true } }
        }
      });
      expect(response).toStrictEqual(mockPermits);
    });

    it('fetches permits with notes included when includeNotes is true', async () => {
      mockRepos.permit.findMany.mockResolvedValueOnce([TEST_PERMIT_1] as never);
      filterSpy.mockResolvedValueOnce([TEST_PERMIT_1] as never);

      await permitService.listPermitsService(TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR, TEST_CURRENT_CONTEXT, {
        activityId: TEST_PERMIT_1.activityId,
        includeNotes: true
      });

      expect(mockRepos.permit.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            permitNote: { orderBy: { createdAt: 'desc' } }
          })
        })
      );
    });
  });

  describe('searchPermitsService', () => {
    it('calls permit.search and applies scope filtering', async () => {
      const mockSearchResult = { permits: [TEST_PERMIT_1], totalRecords: 1 };
      mockRepos.permit.search.mockResolvedValueOnce(mockSearchResult as never);
      filterSpy.mockResolvedValueOnce([TEST_PERMIT_1] as never);

      const response = await permitService.searchPermitsService(
        TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
        TEST_CURRENT_CONTEXT,
        Initiative.HOUSING,
        {}
      );

      expect(mockRepos.permit.search).toHaveBeenCalledWith(Initiative.HOUSING, {});
      expect(response).toStrictEqual({ permits: [TEST_PERMIT_1], totalRecords: 1 });
    });
  });

  describe('upsertPermitService', () => {
    it('upserts permit without PEACH integration', async () => {
      mockRepos.sourceSystemKind.list.mockResolvedValueOnce([TEST_PERMIT_TYPE_1] as never);
      mockRepos.permit.findFirst.mockResolvedValueOnce(null as never);
      mockRepos.permit.upsert.mockResolvedValueOnce(TEST_PERMIT_1 as never);
      mockRepos.permit.findUniqueOrThrow.mockResolvedValueOnce(TEST_PERMIT_1 as never);
      mockRepos.permitTracking.deleteMany.mockResolvedValueOnce({} as never);

      const response = await permitService.upsertPermitService(TEST_PERMIT_1, undefined, [], TEST_PERMIT_TYPE_1);

      expect(mockRepos.sourceSystemKind.list).toHaveBeenCalled();
      expect(mockRepos.permit.upsert).toHaveBeenCalledWith(
        { permitId: expect.any(String) },
        expect.objectContaining({ permitId: expect.any(String) }),
        expect.objectContaining({ permitId: expect.any(String) })
      );
      expect(response).toStrictEqual(TEST_PERMIT_1);
    });

    it('upserts permit tracking items when permitTrackingData is provided', async () => {
      mockRepos.sourceSystemKind.list.mockResolvedValueOnce([] as never);
      mockRepos.permit.findFirst.mockResolvedValueOnce(null as never);
      mockRepos.permit.upsert.mockResolvedValueOnce(TEST_PERMIT_1 as never);
      mockRepos.permit.findUniqueOrThrow.mockResolvedValueOnce(TEST_PERMIT_1 as never);
      mockRepos.permitTracking.deleteMany.mockResolvedValueOnce({} as never);
      upsertPermitTrackingSpy.mockResolvedValue(undefined as never);

      const trackingData = [{ permitTrackingId: 1, trackingId: 'track-1' }];

      await permitService.upsertPermitService(TEST_PERMIT_1, undefined, trackingData as never, TEST_PERMIT_TYPE_1);

      expect(upsertPermitTrackingSpy).toHaveBeenCalledTimes(1);
      expect(upsertPermitTrackingSpy).toHaveBeenCalledWith(
        { permitTracking: mockRepos.permitTracking },
        expect.objectContaining({ permitTrackingId: 1, trackingId: 'track-1' })
      );
    });

    it('throws 400 when PEACH integrated but record summary is invalid', async () => {
      const integratedSystem = { ...TEST_PERMIT_TYPE_1, integrated: true, sourceSystem: 'VFCBC' };
      const trackingData = [{ trackingId: 'REC-123', sourceSystemKind: integratedSystem }];

      mockRepos.sourceSystemKind.list.mockResolvedValueOnce([integratedSystem] as never);
      findPriorityPermitTrackingSpy.mockReturnValueOnce(trackingData[0] as never);
      getPeachRecordSpy.mockResolvedValueOnce({} as never);
      summarizePeachRecordSpy.mockReturnValueOnce(undefined as never);

      await expect(
        permitService.upsertPermitService(TEST_PERMIT_1, undefined, trackingData as never, {
          ...TEST_PERMIT_TYPE_1,
          sourceSystem: 'VFCBC'
        })
      ).rejects.toThrow(new Problem(400, { detail: 'Invalid Peach record summary' }));
    });

    it('calls sendPermitUpdateNotifications for integrated permits on status changes even w/ empty note', async () => {
      const integratedSystem = { ...TEST_PERMIT_TYPE_1, integrated: true, sourceSystem: 'VFCBC' };
      const trackingData = [{ trackingId: 'REC-123', sourceSystemKind: integratedSystem }];
      const oldPermit = { ...TEST_PERMIT_1, state: 'SUBMITTED', stage: 'APPLICATION_SUBMISSION' };
      const newPermit = { ...TEST_PERMIT_1, state: 'APPROVED', stage: 'DECISION' };

      mockRepos.sourceSystemKind.list.mockResolvedValueOnce([integratedSystem] as never);
      findPriorityPermitTrackingSpy.mockReturnValueOnce(trackingData[0] as never);
      getPeachRecordSpy.mockResolvedValueOnce({} as never);
      summarizePeachRecordSpy.mockReturnValueOnce({} as never); // Returns valid truthy summary

      mockRepos.permit.findFirst.mockResolvedValueOnce(oldPermit as never);
      mockRepos.permit.upsert.mockResolvedValueOnce(newPermit as never);
      mockRepos.permit.findUniqueOrThrow.mockResolvedValueOnce(newPermit as never);
      mockRepos.permitTracking.deleteMany.mockResolvedValueOnce({} as never);
      sendNotificationsSpy.mockResolvedValueOnce(undefined);

      await permitService.upsertPermitService(
        newPermit,
        [{ permitId: newPermit.permitId, note: '   ' } as never], // Empty/whitespace note
        trackingData as never,
        { ...TEST_PERMIT_TYPE_1, sourceSystem: 'VFCBC' }
      );

      expect(sendNotificationsSpy).toHaveBeenCalledTimes(1);
      expect(sendNotificationsSpy).toHaveBeenCalledWith(
        expect.anything(),
        newPermit,
        false,
        'This application is approved in the decision.'
      );
    });

    it('calls sendPermitUpdateNotifications when status changed', async () => {
      const oldPermit = { ...TEST_PERMIT_1, state: 'APPROVED' };
      const newPermit = { ...TEST_PERMIT_1, state: 'REJECTED' };

      mockRepos.sourceSystemKind.list.mockResolvedValueOnce([] as never);
      mockRepos.permit.findFirst.mockResolvedValueOnce(oldPermit as never);
      mockRepos.permit.upsert.mockResolvedValueOnce(newPermit as never);
      mockRepos.permit.findUniqueOrThrow.mockResolvedValueOnce(TEST_PERMIT_1 as never);
      mockRepos.permitTracking.deleteMany.mockResolvedValueOnce({ count: 0 } as never);
      sendNotificationsSpy.mockResolvedValueOnce(undefined);

      await permitService.upsertPermitService(
        newPermit,
        [{ permitId: TEST_PERMIT_1.permitId, note: 'Status changed' } as never],
        [],
        TEST_PERMIT_TYPE_1
      );

      expect(sendNotificationsSpy).toHaveBeenCalled();
    });

    it('does not call sendPermitUpdateNotifications when note is empty and status unchanged', async () => {
      mockRepos.sourceSystemKind.list.mockResolvedValueOnce([] as never);
      mockRepos.permit.findFirst.mockResolvedValueOnce(TEST_PERMIT_1 as never);
      mockRepos.permit.upsert.mockResolvedValueOnce(TEST_PERMIT_1 as never);
      mockRepos.permit.findUniqueOrThrow.mockResolvedValueOnce(TEST_PERMIT_1 as never);
      mockRepos.permitTracking.deleteMany.mockResolvedValueOnce({ count: 0 } as never);

      await permitService.upsertPermitService(
        TEST_PERMIT_1,
        [{ permitId: TEST_PERMIT_1.permitId, note: '  ' } as never],
        [],
        TEST_PERMIT_TYPE_1
      );

      expect(sendNotificationsSpy).not.toHaveBeenCalled();
    });
  });
});
