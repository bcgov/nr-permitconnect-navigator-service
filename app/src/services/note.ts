import prisma from '../db/dataConnection';
import { note } from '../db/models';
import { v4 as uuidv4 } from 'uuid';
import { addDashesToUuid } from '../components/utils';

import type { CurrentUser, Note } from '../types';
import { JwtPayload } from 'jsonwebtoken';

const service = {
  /**
   * @function createNote
   * Creates a Permit
   * @param note Note Object
   * @returns {Promise<object>} The result of running the findUnique operation
   */
  createNote: async (data: Note, currentUser: CurrentUser) => {
    const newNote = {
      ...data,
      createdBy: addDashesToUuid((currentUser.tokenPayload as JwtPayload)?.idir_user_guid),
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
      where: {
        submission_id: submissionId
      }
    });
    return response.map((x) => note.fromPrismaModel(x));
  }
};

export default service;
