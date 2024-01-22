import { Prisma } from '@prisma/client';
import disconnectRelation from '../utils/disconnectRelation';

import type { IStamps } from '../../interfaces/IStamps';
import type { Document } from '../../types';

// Define types
const _document = Prisma.validator<Prisma.documentDefaultArgs>()({});
const _documentWithGraph = Prisma.validator<Prisma.documentDefaultArgs>()({});

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

type PrismaRelationDocument = Omit<Prisma.documentGetPayload<typeof _document>, 'submissionId' | keyof IStamps> &
  SubmissionRelation;

type PrismaGraphDocument = Prisma.documentGetPayload<typeof _documentWithGraph>;

export default {
  toPrismaModel(input: Document): PrismaRelationDocument {
    return {
      documentId: input.documentId as string,
      filename: input.filename,
      mimeType: input.mimeType,
      filesize: BigInt(input.filesize),
      submission: input.submissionId ? { connect: { submissionId: input.submissionId } } : disconnectRelation
    };
  },

  fromPrismaModel(input: PrismaGraphDocument | null): Document | null {
    if (!input) return null;

    return {
      documentId: input.documentId,
      filename: input.filename,
      mimeType: input.mimeType,
      filesize: Number(input.filesize),
      createdAt: input.createdAt?.toISOString(),
      submissionId: input.submissionId as string
    };
  }
};