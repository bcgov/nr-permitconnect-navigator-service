import prisma from '../db/dataConnection';
import { note } from '../db/models';
import { v4 as uuidv4 } from 'uuid';

import type { Note } from '../types';

const service = {
  /**
   * @function createNote
   * Creates a note
   * @param {Note} data Note object
   * @returns {Promise<Note>} The result of running the create operation
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

  deleteNote: async (noteId: string) => {
    const result = await prisma.note.update({
      where: {
        note_id: noteId
      },
      data: {
        is_deleted: true
      }
    });

    return note.fromPrismaModel(result);
  },

  /**
   * @function listBringForward
   * Retrieve a list of notes with the Bring forward type
   * @param {string} bringForwardState Optional state to filter on
   * @returns {Promise<Note[]>} The result of running the findMany operation
   */
  listBringForward: async (bringForwardState?: string, isDeleted: boolean = false) => {
    const response = await prisma.note.findMany({
      orderBy: {
        bring_forward_date: 'asc'
      },
      where: {
        note_type: 'Bring forward',
        bring_forward_state: bringForwardState,
        is_deleted: isDeleted
      }
    });
    return response.map((x) => note.fromPrismaModel(x));
  },

  /**
   * @function listNotes
   * Retrieve a list of notes associated with a given activity
   * @param {string} activityId PCNS Activity ID
   * @returns {Promise<Note[]>} The result of running the findMany operation
   */
  listNotes: async (activityId: string, isDeleted: boolean = false) => {
    const response = await prisma.note.findMany({
      orderBy: {
        created_at: 'desc'
      },
      where: {
        activity_id: activityId,
        is_deleted: isDeleted
      }
    });
    return response.map((x) => note.fromPrismaModel(x));
  },

  updateNote: async (data: Note) => {
    return await prisma.$transaction(async (trx) => {
      await trx.note.update({
        where: {
          note_id: data.noteId
        },
        data: {
          is_deleted: true
        }
      });

      const newNote = {
        ...data,
        noteId: uuidv4()
      };

      const newCreatedNote = await trx.note.create({
        data: note.toPrismaModel(newNote)
      });

      return note.fromPrismaModel(newCreatedNote);
    });
  }
};

export default service;
