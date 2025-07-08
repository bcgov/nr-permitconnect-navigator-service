import { v4 as uuidv4 } from 'uuid';

import prisma from '../db/dataConnection';
import { IStamps } from '../interfaces/IStamps';

import type { NoteHistory } from '../types';
import { BringForwardType } from '../utils/enums/projectCommon';
import { Initiative } from '../utils/enums/application';

const service = {
  /**
   * @function createNoteHistory
   * Creates a note history
   * @param {NoteHistory} data Note history object
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
   * @returns {Promise<NoteHistory>} The result of running the update operation
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
   * @function getNoteHistory
   * Get a specifc note history
   * @param {string} noteHistoryId ID of the note history to get
   * @returns {Promise<NoteHistory>} The result of running the findFirstOrThrow operation
   */
  getNoteHistory: async (noteHistoryId: string) => {
    const result = await prisma.note_history.findFirstOrThrow({
      where: {
        noteHistoryId: noteHistoryId
      },
      include: {
        note: { orderBy: { createdAt: 'desc' } }
      }
    });
    return result;
  },

  /**
   * @function listBringForward
   * Retrieve a list of note histories by the given state
   * @param {Initiative} initiative PCNS initiative type
   * @param {BringForwardType} state The BringForwardType to list
   * @returns {Promise<NoteHistory[]>} The result of running the findMany operation
   */
  listBringForward: async (initiative: Initiative, state: BringForwardType = BringForwardType.UNRESOLVED) => {
    const response = await prisma.note_history.findMany({
      where: {
        bringForwardState: state,
        isDeleted: false,
        activity: {
          is_deleted: false,
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
        note: { orderBy: { createdAt: 'desc' } }
      }
    });

    return response;
  },

  /**
   * @function updateNoteHistory
   * Updates a note history
   * @param {NoteHistory} data Note history data to update
   * @returns {Promise<NoteHistory>} The result of running the update operation
   */
  updateNoteHistory: async (data: NoteHistory) => {
    const response = await prisma.note_history.update({
      data: data,
      where: {
        noteHistoryId: data.noteHistoryId
      }
    });

    return response;
  }
};

export default service;
