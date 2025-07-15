import { v4 as uuidv4 } from 'uuid';

import prisma from '../db/dataConnection';
import { IStamps } from '../interfaces/IStamps';
import { BringForwardType } from '../utils/enums/projectCommon';
import { Initiative } from '../utils/enums/application';

import type { NoteHistory, NoteHistoryBase } from '../types';

/**
 * Create a note history
 * @param data - The note history object to create
 * @returns A Promise that resolves to the created resource
 */
export const createNoteHistory = async (data: NoteHistoryBase): Promise<NoteHistory> => {
  const response = await prisma.note_history.create({
    data: {
      ...data,
      noteHistoryId: uuidv4()
    }
  });

  return response;
};

/**
 * Soft deletes a note history by marking is as deleted
 * @param noteHistoryId - The ID of the note history to delete
 * @returns A Promise that resolves to the deleted resource
 */
export const deleteNoteHistory = async (noteHistoryId: string, updateStamp: Partial<IStamps>): Promise<NoteHistory> => {
  const result = await prisma.note_history.update({
    where: {
      noteHistoryId: noteHistoryId
    },
    data: {
      isDeleted: true,
      updatedAt: updateStamp.updatedAt,
      updatedBy: updateStamp.updatedBy
    }
  });

  return result;
};

/**
 * Get a note history
 * @param noteHistoryId - The ID of the note history to retrieve
 * @returns A Promise that resolves to the created resource
 */
export const getNoteHistory = async (noteHistoryId: string): Promise<NoteHistory> => {
  const result = await prisma.note_history.findFirstOrThrow({
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
 * @param initiative - The initiative for which the note history belongs to
 * @param state - The state to search for
 * @returns A Promise that resolves to the note histories for the given parameters
 */
export const listBringForward = async (
  initiative: Initiative,
  state: BringForwardType = BringForwardType.UNRESOLVED
): Promise<NoteHistory[]> => {
  const response = await prisma.note_history.findMany({
    where: {
      bringForwardState: state,
      isDeleted: false,
      activity: {
        isDeleted: false,
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
 * @function listNoteHistory
 * Retrieve a list of note histories and the corresponding notes associated with a given activity
 * @param {string} activityId PCNS Activity ID
 * @returns {Promise<NoteHistory[]>} The result of running the findMany operation
 */
/**
 * Get all note histories for the given activity
 * @param activityId - The ID of the activity the note histories belong to
 * @param isDeleted - Boolean flag represented if soft deleted note histories are to be included
 * @returns A Promise that resolves to the permit types for the given initiative
 */
export const listNoteHistory = async (activityId: string, isDeleted: boolean = false): Promise<NoteHistory[]> => {
  const response = await prisma.note_history.findMany({
    where: {
      activityId: activityId,
      isDeleted: isDeleted
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
 * @param data - The note history to update
 * @returns A Promise that resolves to the updated resource
 */
export const updateNoteHistory = async (data: NoteHistoryBase): Promise<NoteHistory> => {
  const response = await prisma.note_history.update({
    data: data,
    where: {
      noteHistoryId: data.noteHistoryId
    }
  });

  return response;
};
