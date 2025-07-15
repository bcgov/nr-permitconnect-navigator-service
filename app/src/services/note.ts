import prisma from '../db/dataConnection';

import type { Note, NoteBase } from '../types';

const service = {
  /**
   * Create a Note
   * @param data - The Note object to create
   * @returns A Promise that resolves to the created resource
   */
  createNote: async (data: NoteBase): Promise<Note> => {
    const response = await prisma.note.create({
      data
    });

    return response;
  }
};

export default service;
