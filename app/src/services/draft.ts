import prisma from '../db/dataConnection';
import { jsonToPrismaInputJson } from '../db/utils/utils';
import { DraftCode } from '../utils/enums/projectCommon';

import type { Draft, DraftBase } from '../types';

/**
 * @function createDraft
 * Create a draft
 * @param {Draft} data Draft data
 * @returns {Promise<Draft>} The result of running the create operation
 */
export const createDraft = async (data: DraftBase): Promise<Draft> => {
  const result = await prisma.draft.create({
    data: {
      draftId: data.draftId,
      activityId: data.activityId,
      draftCode: data.draftCode,
      data: jsonToPrismaInputJson(data.data),
      createdAt: data.createdAt,
      createdBy: data.createdBy
    }
  });

  return result;
};

/**
 * @function deleteDraft
 * Deletes the draft
 * @param {string} draftId Draft ID
 * @returns {Promise<Draft>} The result of running the delete operation
 */
export const deleteDraft = async (draftId: string): Promise<Draft> => {
  const result = await prisma.draft.delete({ where: { draftId } });
  return result;
};

/**
 * @function getDraft
 * Gets a specific draft from the PCNS database
 * @param {string} draftId Draft ID
 * @returns {Promise<Partial<Draft> | null>} The result of running the findFirst operation
 */
export const getDraft = async (draftId: string): Promise<Draft> => {
  const result = await prisma.draft.findFirstOrThrow({ where: { draftId } });
  return result;
};

/**
 * @function getDrafts
 * Gets a list of drafts
 * @param {DraftCode} draftCode Optional draft code to filter on
 * @returns {Promise<Partial<Draft>[]>} The result of running the findMany operation
 */
export const getDrafts = async (draftCode?: DraftCode): Promise<Draft[]> => {
  const result = await prisma.draft.findMany({ where: { draftCode } });
  return result;
};

/**
 * @function updateDraft
 * Updates a specific draft
 * @param {Draft} data Draft data
 * @returns {Promise<Draft>} The result of running the update operation
 */
export const updateDraft = async (data: DraftBase): Promise<Draft> => {
  const result = await prisma.draft.update({
    data: { ...data, data: jsonToPrismaInputJson(data.data) },
    where: { draftId: data.draftId }
  });

  return result;
};
