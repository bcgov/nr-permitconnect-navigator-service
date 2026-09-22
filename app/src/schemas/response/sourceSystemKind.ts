import { z } from 'zod';

import '#src/schemas/openapi';
import { source_system_kindModelSchema } from '#prismaZod';

// list() flattens permitTypeSourceSystemKindXref to a permitTypeIds array and doesn't include
// permitTracking/sourceSystemCode - see src/repositories/sourceSystemKind.ts.
export const sourceSystemKindSchema = source_system_kindModelSchema
  .omit({ permitTracking: true, permitTypeSourceSystemKindXref: true, sourceSystemCode: true })
  .extend({ permitTypeIds: z.array(z.number()).optional() })
  .openapi('SourceSystemKind');
