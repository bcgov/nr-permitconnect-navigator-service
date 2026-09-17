import { z } from 'zod';

import '#src/validators/openapi';
import { documentModelSchema } from '#prismaZod';

// createdByFullName is looked up and attached at read time, not a persisted column - see
// src/services/document.ts.
export const documentSchema = documentModelSchema
  .omit({ activity: true })
  .extend({ createdByFullName: z.string().optional() })
  .openapi('Document');
