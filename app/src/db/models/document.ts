import { Prisma } from '@prisma/client';
import disconnectRelation from '../utils/disconnectRelation';

import type { Stamps } from '../stamps';
import type { Document } from '../../types';

// Define types
const _document = Prisma.validator<Prisma.documentDefaultArgs>()({});
const _documentWithGraph = Prisma.validator<Prisma.documentDefaultArgs>()({});

type SubmissionRelation = {
  submission:
    | {
        connect: {
          submission_id: string;
        };
      }
    | {
        disconnect: boolean;
      };
};

type PrismaRelationDocument = Omit<Prisma.documentGetPayload<typeof _document>, 'submission_id' | keyof Stamps> &
  SubmissionRelation;

type PrismaGraphDocument = Prisma.documentGetPayload<typeof _documentWithGraph>;

export default {
  toPrismaModel(input: Document): PrismaRelationDocument {
    return {
      document_id: input.documentId as string,
      filename: input.filename,
      mime_type: input.mimeType,
      filesize: BigInt(input.filesize),
      submission: input.submissionId ? { connect: { submission_id: input.submissionId } } : disconnectRelation
    };
  },

  fromPrismaModel(input: PrismaGraphDocument | null): Document | null {
    if (!input) return null;

    return {
      documentId: input.document_id,
      filename: input.filename,
      mimeType: input.mime_type,
      filesize: Number(input.filesize),
      createdAt: input.created_at?.toISOString(),
      submissionId: input.submission_id as string
    };
  }
};
