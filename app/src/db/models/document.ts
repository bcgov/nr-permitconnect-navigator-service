import { Prisma } from '@prisma/client';

import type { Stamps } from '../stamps.ts';
import type { Document } from '../../types';

// Define types
const _document = Prisma.validator<Prisma.documentDefaultArgs>()({});
const _documentWithGraph = Prisma.validator<Prisma.documentDefaultArgs>()({});

type PrismaRelationDocument = Omit<Prisma.documentGetPayload<typeof _document>, keyof Stamps>;
type PrismaGraphDocument = Prisma.documentGetPayload<typeof _documentWithGraph>;

export default {
  toPrismaModel(input: Document): PrismaRelationDocument {
    return {
      document_id: input.documentId,
      activity_id: input.activityId,
      filename: input.filename,
      mime_type: input.mimeType,
      filesize: BigInt(input.filesize)
    };
  },

  fromPrismaModel(input: PrismaGraphDocument): Document {
    return {
      documentId: input.document_id,
      activityId: input.activity_id,
      filename: input.filename,
      mimeType: input.mime_type,
      filesize: Number(input.filesize),
      createdAt: input.created_at?.toISOString(),
      createdBy: input.created_by,
      createdByFullName: null
    };
  }
};
