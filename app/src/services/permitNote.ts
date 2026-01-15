import type { PrismaTransactionClient } from '../db/dataConnection.ts';
import type { PermitNote, PermitNoteBase } from '../types/index.ts';

/**
 * Create a permit note
 * @param tx Prisma transaction client
 * @param data The permit note object to create
 * @returns A Promise that resolves to the created permit note
 */
export const createPermitNote = async (tx: PrismaTransactionClient, data: PermitNoteBase): Promise<PermitNote> => {
  const create = await tx.permit_note.create({
    data
  });

  return create;
};
