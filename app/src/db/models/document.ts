import { Prisma } from '@prisma/client';
import { default as submission } from './submission';
import disconnectRelation from '../utils/disconnectRelation';

import type { IStamps } from '../../interfaces/IStamps';
import type { Document as AppDocument } from '../../types';

// Define types
const _document = Prisma.validator<Prisma.documentDefaultArgs>()({});
const _documentWithRelations = Prisma.validator<Prisma.documentDefaultArgs>()({
  include: { submission: { include: { user: true } } }
});

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
type DBDocument = Omit<Prisma.documentGetPayload<typeof _document>, 'submissionId' | keyof IStamps> &
  SubmissionRelation;

type Document = Prisma.documentGetPayload<typeof _documentWithRelations>;

export default {
  toDBModel(input: AppDocument): DBDocument {
    return {
      documentId: input.documentId as string,
      filename: input.filename,
      mimeType: input.mimeType,
      submission: input.submission?.submissionId
        ? { connect: { submissionId: input.submission.submissionId } }
        : disconnectRelation
    };
  },

  fromDBModel(input: Document | null): AppDocument | null {
    if (!input) return null;

    return {
      documentId: input.documentId,
      filename: input.filename,
      mimeType: input.mimeType,
      submission: submission.fromDBModel(input.submission),
      submissionId: input.submissionId as string
    };
  }
};
