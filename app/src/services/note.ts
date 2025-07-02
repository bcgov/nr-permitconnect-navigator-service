import { v4 as uuidv4 } from 'uuid';

import prisma from '../db/dataConnection';

import type { Note } from '../types';

const service = {
  /**
   * @function createNote
   * Creates a note
   * @param {Note} data Note object
   * @returns {Promise<Note>} The result of running the create operation
   */
  createNote: async (data: Note) => {
    const response = await prisma.note.create({
      data: {
        noteId: uuidv4(),
        noteHistoryId: data.noteHistoryId as string,
        note: data.note,
        createdAt: data.createdAt,
        createdBy: data.createdBy
      }
    });

    return response;
  }
};

export default service;
