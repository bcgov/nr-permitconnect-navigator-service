import { Prisma } from '@prisma/client';

import type { Stamps } from '../stamps.ts';
import type { PermitNote } from '../../types/index.ts';

// Define types
const _permitNote = Prisma.validator<Prisma.permit_noteDefaultArgs>()({});

type PrismaRelationPermitNote = Omit<Prisma.permit_noteGetPayload<typeof _permitNote>, keyof Stamps>;
type PrismaRelationPermitNoteWithStamps = Prisma.permit_noteGetPayload<typeof _permitNote>;

export default {
  toPrismaModel(input: PermitNote): PrismaRelationPermitNote {
    return {
      permit_note_id: input.permitNoteId,
      permit_id: input.permitId,
      note: input.note,
      is_deleted: input.isDeleted
    };
  },

  fromPrismaModel(input: PrismaRelationPermitNoteWithStamps): PermitNote {
    return {
      permitNoteId: input.permit_note_id,
      permitId: input.permit_id,
      note: input.note,
      isDeleted: input.is_deleted,
      updatedAt: input.updated_at?.toISOString() as string,
      createdAt: input.created_at?.toISOString() as string
    };
  }
};
