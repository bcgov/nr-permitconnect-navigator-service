import { z } from 'zod';

import { activityId, uuidv4 } from './common.ts';
import { validate } from '#src/middleware/validation';

export const schema = {
  createDocument: {
    body: z
      .object({
        activityId: activityId,
        documentId: uuidv4,
        filename: z.string().max(255),
        mimeType: z.string().max(255).optional(),
        filesize: z.number()
      })
      .strict()
  },
  deleteDocument: {
    params: z
      .object({
        documentId: z.string().max(255)
      })
      .strict()
  },
  listDocuments: {
    params: z
      .object({
        activityId: activityId
      })
      .strict()
  }
};

export default {
  createDocument: validate(schema.createDocument),
  deleteDocument: validate(schema.deleteDocument),
  listDocuments: validate(schema.listDocuments)
};
