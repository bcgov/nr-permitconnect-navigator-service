import { mockReset } from 'vitest-mock-extended';

import {
  TEST_CONTACT_1,
  TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
  TEST_CURRENT_CONTEXT,
  TEST_ELECTRIFICATION_DRAFT,
  TEST_HOUSING_DRAFT
} from '../data/index.ts';
import { mockRepos } from '../../__mocks__/unitOfWorkMock.ts';
import * as activityDomain from '../../../src/domains/activity.ts';
import * as responseFiltering from '../../../src/parsers/responseFiltering.ts';
import {
  createDraftService,
  deleteDraftService,
  getDraftService,
  listDraftsService,
  updateDraftService,
  upsertDraftService
} from '../../../src/services/draft.ts';
import { Initiative } from '../../../src/utils/enums/application.ts';
import { ActivityContactRole, DraftCode } from '../../../src/utils/enums/projectCommon.ts';

import type { Prisma } from '@prisma/client';
import type { DraftBase } from '../../../src/types/index.ts';

vi.mock('config');

const createActivitySpy = vi.spyOn(activityDomain, 'createActivity');
const filterSpy = vi.spyOn(responseFiltering, 'filterActivityResponseByScope');

describe('draft service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReset(mockRepos);
  });

  describe('createDraftService', () => {
    it('creates draft with jsonToPrismaInputJson conversion', async () => {
      const draftData = {
        draftId: TEST_ELECTRIFICATION_DRAFT.draftId,
        activityId: TEST_ELECTRIFICATION_DRAFT.activityId,
        draftCode: TEST_ELECTRIFICATION_DRAFT.draftCode,
        data: { test: 'data' } as Prisma.JsonValue
      } as DraftBase;

      mockRepos.draft.create.mockResolvedValue(TEST_ELECTRIFICATION_DRAFT as never);

      const result = await createDraftService(draftData);

      expect(mockRepos.draft.create).toHaveBeenCalledTimes(1);
      expect(mockRepos.draft.create).toHaveBeenCalledWith({
        draftId: draftData.draftId,
        activityId: draftData.activityId,
        draftCode: draftData.draftCode,
        data: expect.any(Object)
      });
      expect(result).toEqual(TEST_ELECTRIFICATION_DRAFT);
    });
  });

  describe('deleteDraftService', () => {
    it('deletes the activity associated with the draft', async () => {
      mockRepos.draft.findUniqueOrThrow.mockResolvedValue(TEST_HOUSING_DRAFT as never);
      mockRepos.activity.delete.mockResolvedValue(undefined as never);

      await deleteDraftService(TEST_HOUSING_DRAFT.draftId);

      expect(mockRepos.draft.findUniqueOrThrow).toHaveBeenCalledTimes(1);
      expect(mockRepos.draft.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { draftId: TEST_HOUSING_DRAFT.draftId }
      });
      expect(mockRepos.activity.delete).toHaveBeenCalledTimes(1);
      expect(mockRepos.activity.delete).toHaveBeenCalledWith(
        { activityId: TEST_HOUSING_DRAFT.activityId },
        { hard: true }
      );
    });
  });

  describe('getDraftService', () => {
    it('calls draft.findFirstOrThrow and returns result', async () => {
      mockRepos.draft.findFirstOrThrow.mockResolvedValue(TEST_HOUSING_DRAFT as never);

      const result = await getDraftService(TEST_HOUSING_DRAFT.draftId);

      expect(mockRepos.draft.findFirstOrThrow).toHaveBeenCalledTimes(1);
      expect(mockRepos.draft.findFirstOrThrow).toHaveBeenCalledWith({
        where: { draftId: TEST_HOUSING_DRAFT.draftId },
        include: { activity: { include: { activityContact: true } } }
      });
      expect(result).toEqual(TEST_HOUSING_DRAFT);
    });
  });

  describe('listDraftsService', () => {
    it('calls draft.findMany and returns filtered result', async () => {
      const drafts = [TEST_HOUSING_DRAFT];
      mockRepos.draft.findMany.mockResolvedValue(drafts as never);
      filterSpy.mockResolvedValue(drafts as never);

      const result = await listDraftsService(
        TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
        TEST_CURRENT_CONTEXT,
        DraftCode.HOUSING_PROJECT
      );

      expect(mockRepos.draft.findMany).toHaveBeenCalledTimes(1);
      expect(mockRepos.draft.findMany).toHaveBeenCalledWith({
        where: { draftCode: DraftCode.HOUSING_PROJECT },
        include: { activity: { include: { activityContact: true } } }
      });
      expect(filterSpy).toHaveBeenCalledTimes(1);
      expect(filterSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          activityContact: mockRepos.activityContact,
          contact: mockRepos.contact
        }),
        TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
        TEST_CURRENT_CONTEXT,
        drafts
      );
      expect(result).toEqual(drafts);
    });
  });

  describe('updateDraftService', () => {
    it('updates draft with jsonToPrismaInputJson conversion', async () => {
      const draftData = {
        draftId: TEST_HOUSING_DRAFT.draftId,
        activityId: TEST_HOUSING_DRAFT.activityId,
        draftCode: TEST_HOUSING_DRAFT.draftCode,
        data: { updated: 'data' } as Prisma.JsonValue
      } as DraftBase;

      mockRepos.draft.update.mockResolvedValue(TEST_HOUSING_DRAFT as never);

      const result = await updateDraftService(draftData);

      expect(mockRepos.draft.update).toHaveBeenCalledTimes(1);
      expect(mockRepos.draft.update).toHaveBeenCalledWith(
        { draftId: draftData.draftId },
        expect.objectContaining({
          draftCode: draftData.draftCode,
          data: expect.any(Object)
        })
      );
      expect(result).toEqual(TEST_HOUSING_DRAFT);
    });
  });

  describe('upsertDraftService', () => {
    it('updates existing draft when draftId is provided', async () => {
      const draftData = {
        draftId: TEST_HOUSING_DRAFT.draftId,
        activityId: TEST_HOUSING_DRAFT.activityId,
        draftCode: TEST_HOUSING_DRAFT.draftCode,
        data: { updated: 'data' } as Prisma.JsonValue
      } as DraftBase;

      mockRepos.draft.update.mockResolvedValue(TEST_HOUSING_DRAFT as never);

      const result = await upsertDraftService(
        TEST_HOUSING_DRAFT.draftId,
        draftData,
        Initiative.HOUSING,
        DraftCode.HOUSING_PROJECT,
        TEST_CURRENT_CONTEXT
      );

      expect(mockRepos.draft.update).toHaveBeenCalledTimes(1);
      expect(mockRepos.draft.update).toHaveBeenCalledWith(
        { draftId: draftData.draftId },
        expect.objectContaining({
          draftCode: draftData.draftCode,
          data: expect.any(Object)
        })
      );
      expect(result).toEqual(TEST_HOUSING_DRAFT);
    });

    it('creates new draft with activity and contact linking when draftId is null', async () => {
      const draftData = {
        draftId: 'new-draft-id',
        activityId: 'new-activity-id',
        draftCode: DraftCode.HOUSING_PROJECT,
        data: { new: 'data' } as Prisma.JsonValue
      } as DraftBase;

      createActivitySpy.mockResolvedValue({ activityId: 'new-activity-id' } as never);
      mockRepos.draft.create.mockResolvedValue(TEST_HOUSING_DRAFT);
      mockRepos.contact.search.mockResolvedValue([TEST_CONTACT_1] as never);
      mockRepos.activityContact.create.mockResolvedValue(undefined as never);

      const result = await upsertDraftService(
        null,
        draftData,
        Initiative.HOUSING,
        DraftCode.HOUSING_PROJECT,
        TEST_CURRENT_CONTEXT
      );

      expect(createActivitySpy).toHaveBeenCalledTimes(1);
      expect(createActivitySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          activity: mockRepos.activity,
          initiative: mockRepos.initiative
        }),
        Initiative.HOUSING
      );

      expect(mockRepos.draft.create).toHaveBeenCalledTimes(1);
      expect(mockRepos.draft.create).toHaveBeenCalledWith({
        draftId: expect.any(String),
        activityId: 'new-activity-id',
        draftCode: DraftCode.HOUSING_PROJECT,
        data: expect.any(Object)
      });

      expect(mockRepos.contact.search).toHaveBeenCalledTimes(1);
      expect(mockRepos.contact.search).toHaveBeenCalledWith({
        userId: [TEST_CURRENT_CONTEXT.userId]
      });

      expect(mockRepos.activityContact.create).toHaveBeenCalledTimes(1);
      expect(mockRepos.activityContact.create).toHaveBeenCalledWith({
        activityId: 'new-activity-id',
        contactId: TEST_CONTACT_1.contactId,
        role: ActivityContactRole.PRIMARY
      });

      expect(result).toEqual(TEST_HOUSING_DRAFT);
    });

    it('does not link contact when contact.search returns empty', async () => {
      const draftData = {
        draftId: 'new-draft-id',
        activityId: 'new-activity-id',
        draftCode: DraftCode.HOUSING_PROJECT,
        data: { new: 'data' } as Prisma.JsonValue
      } as DraftBase;

      createActivitySpy.mockResolvedValue({ activityId: 'new-activity-id' } as never);
      mockRepos.draft.create.mockResolvedValue(TEST_HOUSING_DRAFT as never);
      mockRepos.contact.search.mockResolvedValue([]);

      const result = await upsertDraftService(
        null,
        draftData,
        Initiative.HOUSING,
        DraftCode.HOUSING_PROJECT,
        TEST_CURRENT_CONTEXT
      );

      expect(mockRepos.activityContact.create).not.toHaveBeenCalled();
      expect(result).toEqual(TEST_HOUSING_DRAFT);
    });
  });
});
