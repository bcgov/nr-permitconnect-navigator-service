import prisma from '../db/dataConnection';
import { note } from '../db/models';
import { v4 as uuidv4 } from 'uuid';

import type { Note } from '../types';

const service = {
  /**
   * @function createNote
   * Creates a note
   * @param data Note Object
   * @param identityId string
   * @returns {Promise<object>} The result of running the findUnique operation
   */
  createNote: async (data: Note) => {
    const newNote = {
      ...data,
      noteId: uuidv4()
    };
    const create = await prisma.note.create({
      include: {
        submission: {
          include: { user: true }
        }
      },
      data: note.toPrismaModel(newNote)
    });

    return note.fromPrismaModel(create);
  },

  /**
   * @function listNotes
   * Retrieve a list of permits associated with a given submission
   * @param submissionId PCNS Submission ID
   * @returns {Promise<object>} Array of documents associated with the submission
   */
  listNotes: async (submissionId: string) => {
    const response = await prisma.note.findMany({
      include: {
        submission: {
          include: { user: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      where: {
        submission_id: submissionId
      }
    });
    return response.map((x) => note.fromPrismaModel(x));
  }
};

export default service;
