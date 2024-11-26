import prisma from '../db/dataConnection';
import { draft } from '../db/models';

import type { Draft } from '../types';
import { DraftCode } from '../utils/enums/housing';

const service = {
  /**
   * @function createDraft
   * Create a draft
   * @param {Draft} data Draft data
   * @returns {Promise<Draft>} The result of running the create operation
   */
  createDraft: async (data: Draft) => {
    const result = await prisma.draft.create({
      data: {
        draft_id: data.draftId,
        activity_id: data.activityId,
        draft_code: data.draftCode,
        data: data.data,
        created_at: data.createdAt,
        created_by: data.createdBy
      }
    });

    return draft.fromPrismaModel(result);
  },

  /**
   * @function deleteDraft
   * Deletes the draft
   * @param {string} draftId Draft ID
   * @returns {Promise<Draft>} The result of running the delete operation
   */
  deleteDraft: async (draftId: string) => {
    const result = await prisma.draft.delete({
      where: {
        draft_id: draftId
      }
    });

    return draft.fromPrismaModel(result);
  },

  /**
   * @function getDraft
   * Gets a specific draft from the PCNS database
   * @param {string} draftId Draft ID
   * @returns {Promise<Partial<Draft> | null>} The result of running the findFirst operation
   */
  getDraft: async (draftId: string) => {
    const result = await prisma.draft.findFirst({
      where: {
        draft_id: draftId
      }
    });

    return result ? draft.fromPrismaModel(result) : null;
  },

  /**
   * @function getDrafts
   * Gets a list of drafts
   * @param {DraftCode} draftCode Optional draft code to filter on
   * @returns {Promise<Partial<Draft>[]>} The result of running the findMany operation
   */
  getDrafts: async (draftCode?: DraftCode) => {
    const result = await prisma.draft.findMany({ where: { draft_code: draftCode } });

    return result.map((x) => draft.fromPrismaModel(x));
  },

  /**
   * @function updateDraft
   * Updates a specific draft
   * @param {Draft} data Draft data
   * @returns {Promise<Draft>} The result of running the update operation
   */
  updateDraft: async (data: Draft) => {
    const result = await prisma.draft.update({
      data: { data: data.data, updated_at: data?.updatedAt, updated_by: data?.updatedBy },
      where: {
        draft_id: data.draftId
      }
    });

    return draft.fromPrismaModel(result);
  }
};

export default service;
