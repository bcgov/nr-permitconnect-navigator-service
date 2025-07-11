import prisma from '../db/dataConnection';
import { v4 as uuidv4 } from 'uuid';

import type { PermitNote } from '../types';

const service = {
  /**
   * @function createPermitNote
   * Creates a Permit Note
   * @param {PermitNote} data Permit Note object
   * @returns {Promise<PermitNote | null>} The result of running the create operation
   */
  createPermitNote: async (data: PermitNote) => {
    const newPermitNote = { ...data, permitNoteId: uuidv4() };

    const create = await prisma.permit_note.create({
      data: { ...newPermitNote, createdBy: data.createdBy }
    });
    return create;
  }
};

export default service;
