import { jsonToPrismaInputJson } from '../db/utils/utils.ts';
import { filterActivityResponseByScope } from '../parsers/responseFiltering.ts';
import { unitOfWork } from '../repository/uow.ts';
import { DraftCode } from '../utils/enums/projectCommon.ts';

import type { CurrentAuthorization, CurrentContext, Draft, DraftBase } from '../types/index.ts';

/**
 * Create a draft
 * @param data Draft data
 * @returns A Promise that resolves to the created draft
 */
export const createDraftService = async (data: DraftBase): Promise<Draft> => {
  return await unitOfWork.execute(async ({ draft }) => {
    return draft.create({
      draftId: data.draftId,
      activity: { connect: { activityId: data.activityId } },
      draftCodeDraftDraftCodeTodraftCode: { connect: { draftCode: data.draftCode } },
      data: jsonToPrismaInputJson(data.data)
    });
  });
};

export const deleteDraftService = async (draftId: string): Promise<void> => {
  return await unitOfWork.execute(async ({ activity, draft }) => {
    const dft = await draft.findUniqueOrThrow({ draftId });
    await activity.delete({ activityId: dft?.activityId }, { hard: true });
  });
};

/**
 * Gets a specific draft
 * @param draftId - Draft ID
 * @returns A Promise that resolves to the draft
 */
export const getDraftService = async (draftId: string): Promise<Draft> => {
  return await unitOfWork.execute(async ({ draft }) => {
    return await draft.findFirstOrThrow({
      where: { draftId },
      include: { activity: { include: { activityContact: true } } }
    });
  });
};

/**
 * Get a list of drafts
 * @param currentAuthorization - Authorizations assigned to the current authorized user
 * @param currentContext - Context data of current request
 * @param draftCode - Optional draft code to filter on
 * @returns A Promise that resolves to an array of drafts
 */
export const listDraftsService = async (
  currentAuthorization: CurrentAuthorization,
  currentContext: CurrentContext,
  draftCode?: DraftCode
): Promise<Draft[]> => {
  return await unitOfWork.execute(async ({ activityContact, contact, draft }) => {
    const result = await draft.findMany({
      where: { draftCode },
      include: { activity: { include: { activityContact: true } } }
    });

    return await filterActivityResponseByScope(
      { activityContact, contact },
      currentAuthorization,
      currentContext,
      result
    );
  });
};

/**
 * Updates a specific draft
 * @param data - Draft data
 * @returns A Promise that resolves to the updated draft
 */
export const updateDraft = async (data: DraftBase): Promise<Draft> => {
  return await unitOfWork.execute(async ({ draft }) => {
    return await draft.update({ draftId: data.draftId }, { ...data, data: jsonToPrismaInputJson(data.data) });
  });
};
