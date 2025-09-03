import { jsonToPrismaInputJson } from '../db/utils/utils';
import { DraftCode } from '../utils/enums/projectCommon';

import type { PrismaTransactionClient } from '../db/dataConnection';
import type { Draft, DraftBase } from '../types';

/**
 * Create a draft
 * @param tx Prisma transaction client
 * @param data Draft data
 * @returns A Promise that resolves to the created draft
 */
export const createDraft = async (tx: PrismaTransactionClient, data: DraftBase): Promise<Draft> => {
  const result = await tx.draft.create({
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
 * Deletes the draft
 * @param tx Prisma transaction client
 * @param draftId Draft ID
 */
export const deleteDraft = async (tx: PrismaTransactionClient, draftId: string): Promise<void> => {
  await tx.draft.delete({ where: { draftId } });
};

/**
 * Gets a specific draft from the PCNS database
 * @param tx Prisma transaction client
 * @param draftId Draft ID
 * @returns A Promise that resolves to the draft
 */
export const getDraft = async (tx: PrismaTransactionClient, draftId: string): Promise<Draft> => {
  const result = await tx.draft.findFirstOrThrow({ where: { draftId } });
  return result;
};

/**
 * Gets a list of drafts
 * @param tx Prisma transaction client
 * @param draftCode Optional draft code to filter on
 * @returns A Promise that resolves to an array of drafts
 */
export const getDrafts = async (tx: PrismaTransactionClient, draftCode?: DraftCode): Promise<Draft[]> => {
  const result = await tx.draft.findMany({ where: { draftCode } });
  return result;
};

/**
 * Updates a specific draft
 * @param tx Prisma transaction client
 * @param data Draft data
 * @returns A Promise that resolves to the updated draft
 */
export const updateDraft = async (tx: PrismaTransactionClient, data: DraftBase): Promise<Draft> => {
  const result = await tx.draft.update({
    data: { ...data, data: jsonToPrismaInputJson(data.data) },
    where: { draftId: data.draftId }
  });

  return result;
};
