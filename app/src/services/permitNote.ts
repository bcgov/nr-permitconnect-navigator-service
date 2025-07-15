import { v4 as uuidv4 } from 'uuid';

import prisma from '../db/dataConnection';

import type { PermitNote, PermitNoteBase } from '../types';

/**
 * Create a permit note
 * @param data - The permit note object to create
 * @returns A Promise that resolves to the created resource
 */
export const createPermitNote = async (data: PermitNoteBase): Promise<PermitNote> => {
  const newPermitNote = { ...data, permitNoteId: uuidv4() };

  const create = await prisma.permit_note.create({
    data: { ...newPermitNote, createdBy: data.createdBy }
  });

  return create;
};
