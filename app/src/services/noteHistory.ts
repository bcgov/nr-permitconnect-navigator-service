import { v4 as uuidv4 } from 'uuid';

import prisma from '../db/dataConnection';

import type { NoteHistory } from '../types';
import { IStamps } from '../interfaces/IStamps';

const service = {
  /**
   * @function createNoteHistory
   * Creates a note history
   * @param {NoteHistory} data Note historyobject
   * @returns {Promise<NoteHistory>} The result of running the create operation
   */
  createNoteHistory: async (data: NoteHistory) => {
    const response = await prisma.note_history.create({
      data: {
        ...data,
        noteHistoryId: uuidv4()
      }
    });

    return response;
  },

  /**
   * @function deleteNoteHistory
   * Soft deletes a note history by marking is as deleted
   * @param {string} noteHistoryId ID of the note history to delete
   * @returns {Promise<Note>} The result of running the update operation
   */
  deleteNoteHistory: async (noteHistoryId: string, updateStamp: Partial<IStamps>) => {
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
  },

  /**
   * @function listNoteHistory
   * Retrieve a list of note histories and the corresponding notes associated with a given activity
   * @param {string} activityId PCNS Activity ID
   * @returns {Promise<NoteHistory[]>} The result of running the findMany operation
   */
  listNoteHistory: async (activityId: string, isDeleted: boolean = false) => {
    const response = await prisma.note_history.findMany({
      where: {
        activityId: activityId,
        isDeleted: isDeleted
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        note: true
      }
    });

    return response;
  }
};

export default service;
