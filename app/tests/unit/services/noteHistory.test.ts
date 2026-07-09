import { mockReset } from 'vitest-mock-extended';

import { mockRepos } from '../../__mocks__/unitOfWorkMock.ts';
import {
  TEST_ACTIVITY_HOUSING,
  TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
  TEST_CURRENT_CONTEXT,
  TEST_NOTE_HISTORY_1,
  TEST_NOTE_HISTORY_2,
  TEST_IDIR_USER_1,
  TEST_GENERAL_PROJECT_1,
  TEST_HOUSING_PROJECT_1,
  TEST_ENQUIRY_1
} from '../data/index.ts';
import * as noteHistoryService from '../../../src/services/noteHistory.ts';
import * as noteHistoryDomain from '../../../src/domains/noteHistory.ts';
import { Initiative, Resource, GroupName } from '../../../src/utils/enums/application.ts';
import { BringForwardType } from '../../../src/utils/enums/projectCommon.ts';
import { CurrentAuthorization } from '../../../src/types/index.ts';

vi.mock('config');

const emailBringForwardNotificationSpy = vi.spyOn(noteHistoryDomain, 'emailBringForwardNotification');

describe('noteHistory service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReset(mockRepos);
  });

  describe('createNoteHistoryService', () => {
    it('creates noteHistory and note, returns combined result', async () => {
      const noteStr = 'This is a test note';
      mockRepos.noteHistory.create.mockResolvedValueOnce(TEST_NOTE_HISTORY_1 as never);
      mockRepos.note.create.mockResolvedValueOnce({ noteId: 'note-1', note: noteStr } as never);

      const response = await noteHistoryService.createNoteHistoryService(TEST_NOTE_HISTORY_1, noteStr);

      expect(mockRepos.noteHistory.create).toHaveBeenCalledTimes(1);
      expect(mockRepos.noteHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...TEST_NOTE_HISTORY_1,
          noteHistoryId: expect.any(String)
        })
      );
      expect(mockRepos.note.create).toHaveBeenCalledTimes(1);
      expect(mockRepos.note.create).toHaveBeenCalledWith({
        noteId: expect.any(String),
        noteHistoryId: TEST_NOTE_HISTORY_1.noteHistoryId,
        note: noteStr
      });
      expect(response).toStrictEqual({
        ...TEST_NOTE_HISTORY_1,
        note: [{ noteId: 'note-1', note: noteStr }]
      });
    });
  });

  describe('deleteNoteHistoryService', () => {
    it('deletes noteHistory and related notes', async () => {
      mockRepos.noteHistory.delete.mockResolvedValueOnce({} as never);
      mockRepos.note.deleteMany.mockResolvedValueOnce({} as never);

      await noteHistoryService.deleteNoteHistoryService(TEST_NOTE_HISTORY_1.noteHistoryId);

      expect(mockRepos.noteHistory.delete).toHaveBeenCalledTimes(1);
      expect(mockRepos.noteHistory.delete).toHaveBeenCalledWith({
        noteHistoryId: TEST_NOTE_HISTORY_1.noteHistoryId
      });
      expect(mockRepos.note.deleteMany).toHaveBeenCalledTimes(1);
      expect(mockRepos.note.deleteMany).toHaveBeenCalledWith({
        noteHistoryId: TEST_NOTE_HISTORY_1.noteHistoryId
      });
    });
  });

  describe('listBringForwardsService', () => {
    it('fetches unresolved bring forwards with projects and user details', async () => {
      const mockHistories = [TEST_NOTE_HISTORY_1];
      mockRepos.noteHistory.findMany.mockResolvedValueOnce(mockHistories as never);
      mockRepos.electrificationProject.search.mockResolvedValueOnce([] as never);
      mockRepos.generalProject.search.mockResolvedValueOnce([TEST_GENERAL_PROJECT_1] as never);
      mockRepos.housingProject.search.mockResolvedValueOnce([TEST_HOUSING_PROJECT_1] as never);
      mockRepos.user.findMany.mockResolvedValueOnce([TEST_IDIR_USER_1] as never);
      mockRepos.enquiry.search.mockResolvedValueOnce([TEST_ENQUIRY_1] as never);
      mockRepos.enquiry.search.mockResolvedValueOnce([] as never);
      mockRepos.enquiry.search.mockResolvedValueOnce([] as never);

      const response = await noteHistoryService.listBringForwardsService(Initiative.GENERAL);

      expect(mockRepos.noteHistory.findMany).toHaveBeenCalledTimes(1);
      expect(mockRepos.noteHistory.findMany).toHaveBeenCalledWith({
        where: {
          bringForwardState: BringForwardType.UNRESOLVED,
          activity: {
            initiative: {
              code: Initiative.GENERAL
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          note: { orderBy: { createdAt: 'desc' } }
        }
      });
      expect(response).toHaveLength(1);
      expect(response[0]).toHaveProperty('activityId', TEST_NOTE_HISTORY_1.activityId);
      expect(response[0]).toHaveProperty('noteId', TEST_NOTE_HISTORY_1.noteHistoryId);
      expect(response[0]).toHaveProperty('title', TEST_NOTE_HISTORY_1.title);
    });

    it('returns empty array when no histories found', async () => {
      mockRepos.noteHistory.findMany.mockResolvedValueOnce([] as never);

      const response = await noteHistoryService.listBringForwardsService(Initiative.HOUSING, BringForwardType.RESOLVED);

      expect(response).toStrictEqual([]);
    });

    it('fetches bring forwards with custom state', async () => {
      mockRepos.noteHistory.findMany.mockResolvedValueOnce([] as never);

      await noteHistoryService.listBringForwardsService(Initiative.ELECTRIFICATION, BringForwardType.RESOLVED);

      expect(mockRepos.noteHistory.findMany).toHaveBeenCalledTimes(1);
      expect(mockRepos.noteHistory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            bringForwardState: BringForwardType.RESOLVED,
            activity: {
              initiative: {
                code: Initiative.ELECTRIFICATION
              }
            }
          }
        })
      );
    });
  });

  describe('listNoteHistoriesService', () => {
    it('returns all note histories when user has no scope:self attribute', async () => {
      const mockHistories = [TEST_NOTE_HISTORY_1, TEST_NOTE_HISTORY_2];
      mockRepos.noteHistory.findMany.mockResolvedValueOnce(mockHistories as never);

      const response = await noteHistoryService.listNoteHistoriesService(
        TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
        TEST_ACTIVITY_HOUSING.activityId
      );

      expect(mockRepos.noteHistory.findMany).toHaveBeenCalledTimes(1);
      expect(mockRepos.noteHistory.findMany).toHaveBeenCalledWith({
        where: {
          activityId: TEST_ACTIVITY_HOUSING.activityId
        },
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          note: { orderBy: { createdAt: 'desc' } }
        }
      });
      expect(response).toHaveLength(2);
    });

    it('filters to only shownToProponent=true when user has scope:self attribute', async () => {
      const mockHistories = [
        { ...TEST_NOTE_HISTORY_1, shownToProponent: true },
        { ...TEST_NOTE_HISTORY_2, shownToProponent: false }
      ];
      mockRepos.noteHistory.findMany.mockResolvedValueOnce(mockHistories as never);
      const proponentAuthContext: CurrentAuthorization = {
        ...TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
        attributes: ['scope:self']
      };

      const response = await noteHistoryService.listNoteHistoriesService(
        proponentAuthContext,
        TEST_ACTIVITY_HOUSING.activityId
      );

      expect(response).toHaveLength(1);
      expect(response[0].shownToProponent).toBe(true);
    });
  });

  describe('updateNoteHistoryService', () => {
    it('updates noteHistory, creates note if provided, returns updated record', async () => {
      const noteStr = 'Updated note content';
      const updatedData = { ...TEST_NOTE_HISTORY_1, title: 'Updated Title' };
      mockRepos.noteHistory.update.mockResolvedValueOnce(undefined as never);
      mockRepos.note.create.mockResolvedValueOnce({ noteId: 'note-2', note: noteStr } as never);
      mockRepos.noteHistory.findFirstOrThrow.mockResolvedValueOnce(updatedData as never);
      emailBringForwardNotificationSpy.mockResolvedValueOnce(undefined as never);

      const response = await noteHistoryService.updateNoteHistoryService(
        TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
        TEST_CURRENT_CONTEXT,
        updatedData,
        noteStr,
        Resource.GENERAL_PROJECT
      );

      expect(mockRepos.noteHistory.update).toHaveBeenCalledTimes(1);
      expect(mockRepos.noteHistory.update).toHaveBeenCalledWith(
        { noteHistoryId: updatedData.noteHistoryId },
        updatedData
      );
      expect(mockRepos.note.create).toHaveBeenCalledTimes(1);
      expect(mockRepos.note.create).toHaveBeenCalledWith({
        noteHistoryId: updatedData.noteHistoryId,
        noteId: expect.any(String),
        note: noteStr
      });
      expect(response).toStrictEqual(updatedData);
    });

    it('calls emailBringForwardNotification when navigator updates note', async () => {
      const updatedData = { ...TEST_NOTE_HISTORY_1, title: 'Updated Title' };
      mockRepos.noteHistory.update.mockResolvedValueOnce(undefined as never);
      mockRepos.note.create.mockResolvedValueOnce({ noteId: 'note-3', note: 'note' } as never);
      mockRepos.noteHistory.findFirstOrThrow.mockResolvedValueOnce(updatedData as never);
      emailBringForwardNotificationSpy.mockResolvedValueOnce(undefined as never);

      await noteHistoryService.updateNoteHistoryService(
        TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
        TEST_CURRENT_CONTEXT,
        updatedData,
        'test note',
        Resource.ENQUIRY
      );

      expect(emailBringForwardNotificationSpy).toHaveBeenCalledTimes(1);
      expect(emailBringForwardNotificationSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          electrificationProject: mockRepos.electrificationProject,
          generalProject: mockRepos.generalProject,
          housingProject: mockRepos.housingProject,
          subjectGroup: mockRepos.subjectGroup,
          user: mockRepos.user
        }),
        updatedData,
        TEST_CURRENT_CONTEXT.initiative,
        Resource.ENQUIRY
      );
    });

    it('skips emailBringForwardNotification when user is not navigator', async () => {
      const updatedData = { ...TEST_NOTE_HISTORY_1, title: 'Updated Title' };
      mockRepos.noteHistory.update.mockResolvedValueOnce(undefined as never);
      mockRepos.note.create.mockResolvedValueOnce({ noteId: 'note-4', note: 'note' } as never);
      mockRepos.noteHistory.findFirstOrThrow.mockResolvedValueOnce(updatedData as never);
      const adminAuthContext: CurrentAuthorization = {
        attributes: [],
        groups: [
          {
            groupId: 2,
            initiativeCode: Initiative.HOUSING,
            initiativeId: '123',
            name: GroupName.ADMIN,
            label: 'Admin'
          }
        ]
      };

      await noteHistoryService.updateNoteHistoryService(
        adminAuthContext,
        TEST_CURRENT_CONTEXT,
        updatedData,
        'test note',
        Resource.HOUSING_PROJECT
      );

      expect(emailBringForwardNotificationSpy).not.toHaveBeenCalled();
    });
  });
});
