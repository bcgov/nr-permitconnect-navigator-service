import { Prisma } from '@prisma/client';
import { default as submission } from './submission';

import type { ChefsSubmissionForm, Note } from '../../types';

// Define types
const _note = Prisma.validator<Prisma.noteDefaultArgs>()({});
const _noteWithGraph = Prisma.validator<Prisma.noteDefaultArgs>()({
  include: { submission: { include: { user: true } } }
});

type SubmissionRelation = {
  submission: {
    connect: {
      submissionId: string;
    };
  };
};

type PrismaRelationNote = Omit<Prisma.noteGetPayload<typeof _note>, 'submission_id'> & SubmissionRelation;

type PrismaGraphNote = Prisma.noteGetPayload<typeof _noteWithGraph>;

export default {
  toPrismaModel(input: Note): PrismaRelationNote {
    // Note: submissionId conversion to submission_id will be required here
    return {
      note_id: input.noteId as string,
      note: input.note,
      note_type: input.noteType,
      submission: { connect: { submissionId: input.submissionId } },
      title: input.title,
      createdAt: input.createdAt ? new Date(input.createdAt) : null,
      createdBy: input.createdBy as string,
      updatedAt: input.updatedAt ? new Date(input.updatedAt) : null,
      updatedBy: input.updatedBy as string
    };
  },

  fromPrismaModel(input: PrismaGraphNote | null): Note | null {
    if (!input) return null;

    return {
      noteId: input.note_id,
      note: input.note || '',
      noteType: input.note_type || '',
      submission: submission.fromPrismaModel(input.submission) as ChefsSubmissionForm,
      submissionId: input.submission_id as string,
      title: input.title || '',
      createdAt: input.createdAt?.toISOString() ?? null,
      createdBy: input.createdBy,
      updatedAt: input.updatedAt?.toISOString() ?? null,
      updatedBy: input.updatedBy
    };
  }
};
