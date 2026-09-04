import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockReset } from 'vitest-mock-extended';

import {
  TEST_ACTIVITY_HOUSING,
  TEST_CONTACT_1,
  TEST_CURRENT_CONTEXT,
  TEST_INITIATIVE_HOUSING,
  TEST_NOTE_HISTORY_1,
  TEST_NOTE_HISTORY_2,
  TEST_PERMIT_1,
  TEST_PERMIT_2,
  TEST_PERMIT_3
} from '#tests/unit/data/index';
import { mockRepos } from '#tests/__mocks__/unitOfWorkMock';
import { createActivity, deleteActivity, ensureActivityWithPrimaryContact } from '#src/domains/activity';
import { Initiative } from '#src/utils/enums/application';

describe('activity domain', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReset(mockRepos);
  });

  describe('createActivity', () => {
    it('should create an activity with a unique ID', async () => {
      mockRepos.activity.findUnique.mockResolvedValue(null);
      mockRepos.initiative.findFirstOrThrow.mockResolvedValue({
        ...TEST_INITIATIVE_HOUSING,
        initiativeId: 'init-123',
        code: Initiative.HOUSING
      });
      mockRepos.activity.create.mockResolvedValue({
        ...TEST_ACTIVITY_HOUSING,
        activityId: 'ACTI0001',
        initiativeId: 'init-123'
      });

      const result = await createActivity(mockRepos, Initiative.HOUSING);

      expect(mockRepos.activity.findUnique).toHaveBeenCalled();
      expect(mockRepos.initiative.findFirstOrThrow).toHaveBeenCalledWith({
        where: { code: Initiative.HOUSING }
      });
      expect(mockRepos.activity.create).toHaveBeenCalledWith({
        activityId: expect.any(String),
        initiativeId: 'init-123'
      });
      expect(result.initiativeId).toBe('init-123');
    });

    it('should retry ID generation if generated ID already exists', async () => {
      mockRepos.activity.findUnique
        .mockResolvedValueOnce({ ...TEST_ACTIVITY_HOUSING, activityId: 'EXISTING' })
        .mockResolvedValueOnce(null);
      mockRepos.activity.create.mockResolvedValue({
        ...TEST_ACTIVITY_HOUSING,
        activityId: 'ACTI0002',
        initiativeId: 'init-456'
      });
      mockRepos.initiative.findFirstOrThrow.mockResolvedValue({
        ...TEST_INITIATIVE_HOUSING,
        initiativeId: 'init-456',
        code: Initiative.ELECTRIFICATION
      });

      const result = await createActivity(mockRepos, Initiative.ELECTRIFICATION);

      expect(mockRepos.activity.findUnique).toHaveBeenCalledTimes(2);
      expect(mockRepos.activity.create).toHaveBeenCalled();
      expect(result.initiativeId).toBe('init-456');
    });
  });

  describe('ensureActivityWithPrimaryContact', () => {
    it('reuses an existing activity ID without creating anything', async () => {
      const result = await ensureActivityWithPrimaryContact(
        mockRepos,
        Initiative.HOUSING,
        TEST_CURRENT_CONTEXT,
        'EXISTING1'
      );

      expect(result).toBe('EXISTING1');
      expect(mockRepos.activity.create).not.toHaveBeenCalled();
      expect(mockRepos.contact.search).not.toHaveBeenCalled();
      expect(mockRepos.activityContact.create).not.toHaveBeenCalled();
    });

    it('creates a new activity and links the primary contact when none is given', async () => {
      mockRepos.activity.findUnique.mockResolvedValue(null);
      mockRepos.initiative.findFirstOrThrow.mockResolvedValue({
        ...TEST_INITIATIVE_HOUSING,
        initiativeId: 'init-123',
        code: Initiative.HOUSING
      });
      mockRepos.activity.create.mockResolvedValue({
        ...TEST_ACTIVITY_HOUSING,
        activityId: 'ACTI0001',
        initiativeId: 'init-123'
      });
      mockRepos.contact.search.mockResolvedValueOnce([TEST_CONTACT_1] as never);
      mockRepos.activityContact.create.mockResolvedValueOnce({} as never);

      const result = await ensureActivityWithPrimaryContact(mockRepos, Initiative.HOUSING, TEST_CURRENT_CONTEXT);

      expect(result).toBe('ACTI0001');
      expect(mockRepos.contact.search).toHaveBeenCalledWith({ userId: [TEST_CURRENT_CONTEXT.userId] });
      expect(mockRepos.activityContact.create).toHaveBeenCalledWith({
        activityId: 'ACTI0001',
        contactId: TEST_CONTACT_1.contactId,
        role: 'PRIMARY'
      });
    });

    it('skips linking a contact when none exists for the user', async () => {
      mockRepos.activity.findUnique.mockResolvedValue(null);
      mockRepos.initiative.findFirstOrThrow.mockResolvedValue({
        ...TEST_INITIATIVE_HOUSING,
        initiativeId: 'init-123',
        code: Initiative.HOUSING
      });
      mockRepos.activity.create.mockResolvedValue({
        ...TEST_ACTIVITY_HOUSING,
        activityId: 'ACTI0001',
        initiativeId: 'init-123'
      });
      mockRepos.contact.search.mockResolvedValueOnce([]);

      await ensureActivityWithPrimaryContact(mockRepos, Initiative.HOUSING, TEST_CURRENT_CONTEXT);

      expect(mockRepos.activityContact.create).not.toHaveBeenCalled();
    });

    it('throws when activity creation fails', async () => {
      mockRepos.activity.findUnique.mockResolvedValue(null);
      mockRepos.initiative.findFirstOrThrow.mockResolvedValue({
        ...TEST_INITIATIVE_HOUSING,
        initiativeId: 'init-123',
        code: Initiative.HOUSING
      });
      mockRepos.activity.create.mockResolvedValue(undefined as never);
      mockRepos.contact.search.mockResolvedValueOnce([]);

      await expect(
        ensureActivityWithPrimaryContact(mockRepos, Initiative.HOUSING, TEST_CURRENT_CONTEXT)
      ).rejects.toThrow('Failed to generate activity ID');
    });
  });

  describe('deleteActivity', () => {
    beforeEach(() => {
      mockRepos.noteHistory.findMany.mockResolvedValue([TEST_NOTE_HISTORY_1]);
      mockRepos.permit.findMany.mockResolvedValue([TEST_PERMIT_1]);
      mockRepos.activity.delete.mockResolvedValue(TEST_ACTIVITY_HOUSING);
    });

    it('should hard delete an activity without cascading', async () => {
      await deleteActivity(mockRepos, 'ACTI1234', { hard: true });

      expect(mockRepos.activity.delete).toHaveBeenCalledWith(
        { activityId: 'ACTI1234', deletedAt: null },
        { hard: true }
      );
      expect(mockRepos.activityContact.deleteMany).not.toHaveBeenCalled();
      expect(mockRepos.document.deleteMany).not.toHaveBeenCalled();
      expect(mockRepos.note.deleteMany).not.toHaveBeenCalled();
    });

    it('should soft delete an activity with cascade', async () => {
      await deleteActivity(mockRepos, 'ACTI1234');

      expect(mockRepos.activity.delete).toHaveBeenCalledWith({ activityId: 'ACTI1234', deletedAt: null }, undefined);
      expect(mockRepos.activityContact.deleteMany).toHaveBeenCalledWith({
        activityId: 'ACTI1234',
        deletedAt: null
      });
      expect(mockRepos.document.deleteMany).toHaveBeenCalledWith({
        activityId: 'ACTI1234',
        deletedAt: null
      });
      expect(mockRepos.electrificationProject.deleteMany).toHaveBeenCalledWith({
        activityId: 'ACTI1234',
        deletedAt: null
      });
      expect(mockRepos.enquiry.deleteMany).toHaveBeenCalledWith({
        activityId: 'ACTI1234',
        deletedAt: null
      });
      expect(mockRepos.generalProject.deleteMany).toHaveBeenCalledWith({
        activityId: 'ACTI1234',
        deletedAt: null
      });
      expect(mockRepos.housingProject.deleteMany).toHaveBeenCalledWith({
        activityId: 'ACTI1234',
        deletedAt: null
      });
      expect(mockRepos.noteHistory.deleteMany).toHaveBeenCalledWith({
        activityId: 'ACTI1234',
        deletedAt: null
      });
      expect(mockRepos.permit.deleteMany).toHaveBeenCalledWith({
        activityId: 'ACTI1234',
        deletedAt: null
      });
    });

    it('should cascade delete to notes and permitTracking for soft delete', async () => {
      await deleteActivity(mockRepos, 'ACTI1234');

      expect(mockRepos.noteHistory.findMany).toHaveBeenCalledWith(
        { where: { activityId: 'ACTI1234' }, select: { noteHistoryId: true } },
        { includeDeleted: true }
      );
      expect(mockRepos.permit.findMany).toHaveBeenCalledWith(
        { where: { activityId: 'ACTI1234' }, select: { permitId: true } },
        { includeDeleted: true }
      );
      expect(mockRepos.note.deleteMany).toHaveBeenCalledWith({
        noteHistoryId: { in: [TEST_NOTE_HISTORY_1.noteHistoryId] },
        deletedAt: null
      });
      expect(mockRepos.permitNote.deleteMany).toHaveBeenCalledWith({
        permitId: { in: [TEST_PERMIT_1.permitId] },
        deletedAt: null
      });
      expect(mockRepos.permitTracking.deleteMany).toHaveBeenCalledWith({
        permitId: { in: [TEST_PERMIT_1.permitId] },
        deletedAt: null
      });
    });

    it('should handle empty notes and permits during cascade delete', async () => {
      mockRepos.noteHistory.findMany.mockResolvedValue([]);
      mockRepos.permit.findMany.mockResolvedValue([]);

      await deleteActivity(mockRepos, 'ACTI1234');

      expect(mockRepos.note.deleteMany).toHaveBeenCalledWith({
        noteHistoryId: { in: [] },
        deletedAt: null
      });
      expect(mockRepos.permitNote.deleteMany).toHaveBeenCalledWith({
        permitId: { in: [] },
        deletedAt: null
      });
      expect(mockRepos.permitTracking.deleteMany).toHaveBeenCalledWith({
        permitId: { in: [] },
        deletedAt: null
      });
    });

    it('should handle multiple notes and permits during cascade delete', async () => {
      mockRepos.noteHistory.findMany.mockResolvedValue([TEST_NOTE_HISTORY_1, TEST_NOTE_HISTORY_2]);
      mockRepos.permit.findMany.mockResolvedValue([TEST_PERMIT_1, TEST_PERMIT_2, TEST_PERMIT_3]);

      await deleteActivity(mockRepos, 'ACTI1234');

      expect(mockRepos.note.deleteMany).toHaveBeenCalledWith({
        noteHistoryId: { in: [TEST_NOTE_HISTORY_1.noteHistoryId, TEST_NOTE_HISTORY_2.noteHistoryId] },
        deletedAt: null
      });
      expect(mockRepos.permitNote.deleteMany).toHaveBeenCalledWith({
        permitId: { in: [TEST_PERMIT_1.permitId, TEST_PERMIT_2.permitId, TEST_PERMIT_3.permitId] },
        deletedAt: null
      });
      expect(mockRepos.permitTracking.deleteMany).toHaveBeenCalledWith({
        permitId: { in: [TEST_PERMIT_1.permitId, TEST_PERMIT_2.permitId, TEST_PERMIT_3.permitId] },
        deletedAt: null
      });
    });
  });
});
