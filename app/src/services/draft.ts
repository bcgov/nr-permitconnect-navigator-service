import { v4 as uuidv4 } from 'uuid';

import { jsonToPrismaInputJson } from '../db/utils/utils.ts';
import { createActivity } from '../domains/activity.ts';
import { filterActivityResponseByScope } from '../parsers/responseFiltering.ts';
import { unitOfWork } from '../repository/unitOfWork.ts';
import { Initiative } from '../utils/enums/application.ts';
import { ActivityContactRole, DraftCode } from '../utils/enums/projectCommon.ts';

import type { CurrentAuthorization, CurrentContext, Draft, DraftBase, Maybe } from '../types/index.ts';

/**
 * Create a draft
 * @param data Draft data
 * @returns A Promise that resolves to the created draft
 */
export const createDraftService = async (data: DraftBase): Promise<Draft> => {
  return await unitOfWork.execute(async ({ draft }) => {
    return draft.create({
      draftId: data.draftId,
      activityId: data.activityId,
      draftCode: data.draftCode,
      data: jsonToPrismaInputJson(data.data)
    });
  });
};

export const deleteDraftService = async (draftId: string): Promise<void> => {
  return await unitOfWork.execute(async ({ activity, draft }) => {
    const dft = await draft.findUniqueOrThrow({ where: { draftId } });
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
export const updateDraftService = async (data: DraftBase): Promise<Draft> => {
  return await unitOfWork.execute(async ({ draft }) => {
    return await draft.update({ draftId: data.draftId }, { ...data, data: jsonToPrismaInputJson(data.data) });
  });
};

/**
 * Upserts draft data
 * @param draftId - Optional draft ID determining create or update
 * @param data - Draft data
 * @param initiativeCode - Initiative code the draft will belong to
 * @param draftCode - Draft code assigned to the draft
 * @param currentContext - Context data of current request
 * @returns A Promise that resolves to the updated draft
 */
export const upsertDraftService = async (
  draftId: Maybe<string>,
  data: DraftBase,
  initiativeCode: Initiative,
  draftCode: DraftCode,
  currentContext: CurrentContext
): Promise<Draft> => {
  return await unitOfWork.execute(async ({ activity, activityContact, contact, draft, initiative }) => {
    const update = !!draftId;

    if (update) {
      return await draft.update({ draftId: data.draftId }, { ...data, data: jsonToPrismaInputJson(data.data) });
    } else {
      // Create new draft
      const activityId = (await createActivity({ activity, initiative }, initiativeCode))?.activityId;

      const response = await draft.create({
        draftId: uuidv4(),
        activityId,
        draftCode,
        data: jsonToPrismaInputJson(data.data)
      });

      // Link contact to activity
      const contacts = await contact.search({ userId: [currentContext.userId!] });
      if (contacts[0]) {
        await activityContact.create({
          activityId,
          contactId: contacts[0].contactId,
          role: ActivityContactRole.PRIMARY
        });
      }

      return response;
    }
  });
};
