import { generateUniqueActivityId } from '../db/utils/utils.ts';
import { Initiative } from '../utils/enums/application.ts';

import type { PrismaTransactionClient } from '../db/database.ts';
import type { IStamps } from '../interfaces/IStamps.ts';
import type { Activity } from '../types/index.ts';

/**
 * Create an activity for the given initiative with a unique identifier
 * @param tx Prisma transaction client
 * @param initiative The initiative ID
 * @param createStamp The creation stamps
 * @returns A Promise that resolves to the created activity
 */
export const createActivity = async (
  tx: PrismaTransactionClient,
  initiative: Initiative,
  createStamp: Partial<IStamps>
): Promise<Activity> => {
  const initiativeResult = await tx.initiative.findFirstOrThrow({ where: { code: initiative } });

  const response = await tx.activity.create({
    data: {
      activityId: await generateUniqueActivityId(tx),
      initiativeId: initiativeResult.initiativeId,
      createdAt: createStamp.createdAt,
      createdBy: createStamp.createdBy
    }
  });

  return response;
};

/**
 * Soft delete an activity and cascade the soft delete to all related tables.
 * Use this over a hard delete
 * @param tx Prisma transaction client
 * @param activityId Unique activity ID
 * @param deleteStamp Timestamp information of the delete
 */
export const deleteActivity = async (
  tx: PrismaTransactionClient,
  activityId: string,
  deleteStamp: Partial<IStamps>
): Promise<void> => {
  const softDeleteData = {
    deletedAt: deleteStamp.deletedAt,
    deletedBy: deleteStamp.deletedBy
  };

  await tx.activity.update({
    data: softDeleteData,
    where: { activityId }
  });

  await tx.activity_contact.updateMany({
    data: softDeleteData,
    where: { activityId, deletedAt: null }
  });

  await tx.document.updateMany({
    data: softDeleteData,
    where: { activityId, deletedAt: null }
  });

  await tx.draft.updateMany({
    data: softDeleteData,
    where: { activityId, deletedAt: null }
  });

  await tx.electrification_project.updateMany({
    data: softDeleteData,
    where: { activityId, deletedAt: null }
  });

  await tx.enquiry.updateMany({
    data: softDeleteData,
    where: { activityId, deletedAt: null }
  });

  await tx.general_project.updateMany({
    data: softDeleteData,
    where: { activityId, deletedAt: null }
  });

  await tx.housing_project.updateMany({
    data: softDeleteData,
    where: { activityId, deletedAt: null }
  });

  const deletedNoteHistories = (
    await tx.note_history.updateManyAndReturn({
      data: softDeleteData,
      where: { activityId, deletedAt: null }
    })
  ).map((noteHistory) => noteHistory.noteHistoryId);

  await tx.note.updateMany({
    data: softDeleteData,
    where: { noteHistoryId: { in: deletedNoteHistories }, deletedAt: null }
  });

  const deletedPermits = (
    await tx.permit.updateManyAndReturn({
      data: softDeleteData,
      where: { activityId, deletedAt: null }
    })
  ).map((permit) => permit.permitId);

  await tx.permit_note.updateMany({
    data: softDeleteData,
    where: { permitId: { in: deletedPermits }, deletedAt: null }
  });

  await tx.permit_tracking.updateMany({
    data: softDeleteData,
    where: { permitId: { in: deletedPermits }, deletedAt: null }
  });
};

/**
 * Hard delete an activity
 * Should not be used unless absolutely sure as it will cascade
 * @param tx Prisma transaction client
 * @param activityId Unique activity ID
 */
export const deleteActivityHard = async (tx: PrismaTransactionClient, activityId: string): Promise<void> => {
  await tx.activity.delete({
    where: { activityId }
  });
};

/**
 * Get an activity
 * @param tx Prisma transaction client
 * @param activityId Unique activity ID
 * @returns A Promise that resolves to the specific activity or null if not found
 */
export const getActivity = async (tx: PrismaTransactionClient, activityId: string): Promise<Activity | null> => {
  const response = await tx.activity.findFirst({ where: { activityId } });
  return response;
};

/**
 * Get a list of activities
 * @param tx Prisma transaction client
 * @param initiative Optional initiative code, if provided, only return activities for that initiative
 * @returns A Promise that resolves to an array of activities
 */
export const getActivities = async (tx: PrismaTransactionClient, initiative?: Initiative): Promise<Activity[]> => {
  if (initiative) {
    const response = await tx.activity.findMany({
      where: {
        initiative: {
          code: initiative
        }
      }
    });
    return response;
  } else {
    const allActivities = await tx.activity.findMany({});
    return allActivities;
  }
};
