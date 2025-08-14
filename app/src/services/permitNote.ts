import { v4 as uuidv4 } from 'uuid';

import type { PrismaTransactionClient } from '../db/dataConnection';
import type { PermitNote, PermitNoteBase } from '../types';

/**
 * Create a permit note
 * @param tx Prisma transaction client
 * @param data - The permit note object to create
 * @returns A Promise that resolves to the created permit note
 */
export const createPermitNote = async (tx: PrismaTransactionClient, data: PermitNoteBase): Promise<PermitNote> => {
  const newPermitNote = { ...data, permitNoteId: uuidv4() };

  const create = await tx.permit_note.create({
    data: { ...newPermitNote, createdBy: data.createdBy }
  });

  return create;
};
