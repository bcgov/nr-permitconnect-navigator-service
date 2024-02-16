import prisma from '../db/dataConnection';
import { note } from '../db/models';
import { v4 as uuidv4 } from 'uuid';

import type { Note } from '../types';

const service = {
  /**
   * @function createNote
   * Creates a note
   * @param {Note} data Note object
   * @returns {Promise<Note | null>} The result of running the create operation
   */
  createNote: async (data: Note) => {
    const newNote = {
      ...data,
      noteId: uuidv4()
    };

    const response = await prisma.note.create({
      data: note.toPrismaModel(newNote)
    });

    return note.fromPrismaModel(response);
  },

  /**
   * @function listNotes
   * Retrieve a list of permits associated with a given submission
   * @param {string} activityId PCNS Activity ID
   * @returns {Promise<(Note | null)[]>} The result of running the findMany operation
   */
  listNotes: async (activityId: string) => {
    const response = await prisma.note.findMany({
      orderBy: {
        created_at: 'desc'
      },
      where: {
        activity_id: activityId
      }
    });
    return response.map((x) => note.fromPrismaModel(x));
  }
};

export default service;
