import { Prisma } from '@prisma/client';

import type { Note } from '../../types';

// Define types
const _note = Prisma.validator<Prisma.noteDefaultArgs>()({});
const _noteWithGraph = Prisma.validator<Prisma.noteDefaultArgs>()({});

type PrismaRelationNote = Prisma.noteGetPayload<typeof _note>;
type PrismaGraphNote = Prisma.noteGetPayload<typeof _noteWithGraph>;

export default {
  toPrismaModel(input: Note): PrismaRelationNote {
    return {
      note_id: input.noteId,
      activity_id: input.activityId,
      bring_forward_date: input.bringForwardDate ? new Date(input.bringForwardDate) : null,
      bring_forward_state: input.bringForwardState,
      note: input.note,
      note_type: input.noteType,
      title: input.title,
      created_at: input.createdAt ? new Date(input.createdAt) : null,
      created_by: input.createdBy as string,
      updated_at: input.updatedAt ? new Date(input.updatedAt) : null,
      updated_by: input.updatedBy as string
    };
  },

  fromPrismaModel(input: PrismaGraphNote | null): Note | null {
    if (!input) return null;

    return {
      noteId: input.note_id,
      activityId: input.activity_id,
      bringForwardDate: input.bring_forward_date?.toISOString() ?? null,
      bringForwardState: input.bring_forward_state ?? null,
      note: input.note || '',
      noteType: input.note_type || '',
      title: input.title || '',
      createdAt: input.created_at?.toISOString() ?? null,
      createdBy: input.created_by,
      updatedAt: input.updated_at?.toISOString() ?? null,
      updatedBy: input.updated_by
    };
  }
};
