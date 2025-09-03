import type { PrismaTransactionClient } from '../db/dataConnection';
import type { Note, NoteBase } from '../types';

/**
 * Create a Note
 * @param tx Prisma transaction client
 * @param data - The Note object to create
 * @returns A Promise that resolves to the created resource
 */
export const createNote = async (tx: PrismaTransactionClient, data: NoteBase): Promise<Note> => {
  const response = await tx.note.create({
    data
  });

  return response;
};
