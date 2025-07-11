import prisma from '../db/dataConnection';
import { DraftCode } from '../utils/enums/projectCommon';

import type { Draft } from '../types';

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
        draftId: data.draftId,
        activityId: data.activityId,
        draftCode: data.draftCode,
        data: data.data,
        createdAt: data.createdAt,
        createdBy: data.createdBy
      }
    });

    return result;
  },

  /**
   * @function deleteDraft
   * Deletes the draft
   * @param {string} draftId Draft ID
   * @returns {Promise<Draft>} The result of running the delete operation
   */
  deleteDraft: async (draftId: string) => {
    const result = await prisma.draft.delete({ where: { draftId } });

    return result;
  },

  /**
   * @function getDraft
   * Gets a specific draft from the PCNS database
   * @param {string} draftId Draft ID
   * @returns {Promise<Partial<Draft> | null>} The result of running the findFirst operation
   */
  getDraft: async (draftId: string) => {
    const result = await prisma.draft.findFirst({ where: { draftId } });

    return result ?? null;
  },

  /**
   * @function getDrafts
   * Gets a list of drafts
   * @param {DraftCode} draftCode Optional draft code to filter on
   * @returns {Promise<Partial<Draft>[]>} The result of running the findMany operation
   */
  getDrafts: async (draftCode?: DraftCode) => {
    const result = await prisma.draft.findMany({ where: { draftCode } });

    return result;
  },

  /**
   * @function updateDraft
   * Updates a specific draft
   * @param {Draft} data Draft data
   * @returns {Promise<Draft>} The result of running the update operation
   */
  updateDraft: async (data: Draft) => {
    const result = await prisma.draft.update({
      data: { data: data.data, updatedAt: data?.updatedAt, updatedBy: data?.updatedBy },
      where: { draftId: data.draftId }
    });

    return result;
  }
};

export default service;
