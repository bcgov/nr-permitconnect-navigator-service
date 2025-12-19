import { BringForwardType } from '../utils/enums/projectCommon.ts';
import { Initiative } from '../utils/enums/application.ts';

import type { PrismaTransactionClient } from '../db/dataConnection.ts';
import type { IStamps } from '../interfaces/IStamps.ts';
import type { NoteHistory, NoteHistoryBase } from '../types/index.ts';

/**
 * Create a note history
 * @param tx Prisma transaction client
 * @param data - The note history object to create
 * @returns A Promise that resolves to the created resource
 */
export const createNoteHistory = async (tx: PrismaTransactionClient, data: NoteHistoryBase): Promise<NoteHistory> => {
  const response = await tx.note_history.create({
    data
  });

  return response;
};

/**
 * Soft deletes a note history by marking is as deleted
 * @param tx Prisma transaction client
 * @param noteHistoryId - The ID of the note history to delete
 */
export const deleteNoteHistory = async (
  tx: PrismaTransactionClient,
  noteHistoryId: string,
  deleteStamp: Partial<IStamps>
): Promise<void> => {
  await tx.note_history.update({
    where: {
      noteHistoryId: noteHistoryId
    },
    data: {
      deletedAt: deleteStamp.deletedAt,
      deletedBy: deleteStamp.deletedBy
    }
  });
};

/**
 * Get a note history
 * @param tx Prisma transaction client
 * @param noteHistoryId - The ID of the note history to retrieve
 * @returns A Promise that resolves to the created resource
 */
export const getNoteHistory = async (tx: PrismaTransactionClient, noteHistoryId: string): Promise<NoteHistory> => {
  const result = await tx.note_history.findFirstOrThrow({
    where: {
      noteHistoryId: noteHistoryId
    },
    include: {
      note: { orderBy: { createdAt: 'desc' } }
    }
  });
  return result;
};

/**
 * Retrieve a list of bring forward type note histories by the given state
 * @param tx Prisma transaction client
 * @param initiative - The initiative for which the note history belongs to
 * @param state - The state to search for
 * @returns A Promise that resolves to the note histories for the given parameters
 */
export const listBringForward = async (
  tx: PrismaTransactionClient,
  initiative: Initiative,
  state: BringForwardType = BringForwardType.UNRESOLVED
): Promise<NoteHistory[]> => {
  const response = await tx.note_history.findMany({
    where: {
      bringForwardState: state,
      activity: {
        initiative: {
          code: initiative
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

  return response;
};

/**
 * Get all note histories for the given activity
 * @param tx Prisma transaction client
 * @param activityId - The ID of the activity the note histories belong to
 * @returns A Promise that resolves to the permit types for the given initiative
 */
export const listNoteHistory = async (tx: PrismaTransactionClient, activityId: string): Promise<NoteHistory[]> => {
  const response = await tx.note_history.findMany({
    where: {
      activityId: activityId
    },
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      note: { orderBy: { createdAt: 'desc' } }
    }
  });

  return response;
};

/**
 * Update a note history
 * @param tx Prisma transaction client
 * @param data - The note history to update
 * @returns A Promise that resolves to the updated resource
 */
export const updateNoteHistory = async (tx: PrismaTransactionClient, data: NoteHistoryBase): Promise<NoteHistory> => {
  const response = await tx.note_history.update({
    data: data,
    where: {
      noteHistoryId: data.noteHistoryId
    }
  });

  return response;
};
