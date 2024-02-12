import { Prisma } from '@prisma/client';
import disconnectRelation from '../utils/disconnectRelation';

import type { IStamps } from '../../interfaces/IStamps';
import type { Note } from '../../types';

// Define types
const _note = Prisma.validator<Prisma.noteDefaultArgs>()({});
const _noteWithGraph = Prisma.validator<Prisma.noteDefaultArgs>()({});

type SubmissionRelation = {
  submission:
    | {
        connect: {
          submissionId: string;
        };
      }
    | {
        disconnect: boolean;
      };
};

type PrismaRelationNote = Omit<Prisma.noteGetPayload<typeof _note>, 'submissionId' | keyof IStamps> &
  SubmissionRelation;

type PrismaGraphNote = Prisma.noteGetPayload<typeof _noteWithGraph>;

export default {
  toPrismaModel(input: Note): PrismaRelationNote {
    // Note: submissionId conversion to submission_id will be required here
    return {
      note_id: input.note_id as string,
      submission: input.submission_id ? { connect: { submissionId: input.submission_id } } : disconnectRelation,
      category_type: input.category_type,
      note: input.note,
      note_type: input.note_type
    };
  },

  fromPrismaModel(input: PrismaGraphNote | null): Note | null {
    if (!input) return null;

    return {
      note_id: input.note_id,
      submission_id: input.submissionId as string,
      category_type: input.category_type || '',
      note: input.note || '',
      note_type: input.note_type || '',
      createdAt: input.createdAt?.toISOString()
    };
  }
};
