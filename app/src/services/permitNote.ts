/* eslint-disable no-useless-catch */

import prisma from '../db/dataConnection';
import { permit_note } from '../db/models';
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
    try {
      const newPermitNote = { ...data, permitNoteId: uuidv4() };

      const create = await prisma.permit_note.create({
        data: { ...permit_note.toPrismaModel(newPermitNote), created_by: data.createdBy }
      });
      return permit_note.fromPrismaModel(create);
    } catch (e: unknown) {
      throw e;
    }
  }
};

export default service;
