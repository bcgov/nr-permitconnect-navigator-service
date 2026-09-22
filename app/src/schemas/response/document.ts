import { z } from 'zod';

import '#src/schemas/openapi';
import { documentModelSchema } from '#prismaZod';

// createdByFullName is looked up and attached at read time, not a persisted column - see
// src/services/document.ts. filesize is a BigInt column that numeric.ts (a Prisma result
// extension, see src/db/extensions/numeric.ts) converts to a number on every read.
export const documentSchema = documentModelSchema
  .omit({ activity: true, filesize: true })
  .extend({ createdByFullName: z.string().optional(), filesize: z.number() })
  .openapi('Document');
