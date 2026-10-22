import { z } from 'zod';

import '#src/schemas/openapi';
import { source_system_kindModelSchema } from '#prismaZod';
import { SourceSystem } from '#src/db/codes/enums';

// list() flattens permitTypeSourceSystemKindXref to a permitTypeIds array and doesn't include
// permitTracking/sourceSystemCode - see src/repositories/sourceSystemKind.ts.
export const sourceSystemKindSchema = source_system_kindModelSchema
  .omit({ permitTracking: true, permitTypeSourceSystemKindXref: true, sourceSystemCode: true })
  // sourceSystem is a foreign key to a code table, so the spec lists its codes; the database guarantees them
  .extend({
    permitTypeIds: z.array(z.number()).optional(),
    sourceSystem: z.string().openapi({ enum: Object.values(SourceSystem) })
  })
  .openapi('SourceSystemKind');
