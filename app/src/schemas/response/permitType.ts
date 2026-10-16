import { z } from 'zod';

import '#src/schemas/openapi';
import { initiativeModelSchema, permit_typeModelSchema, permit_type_initiative_xrefModelSchema } from '#prismaZod';
import { SourceSystem } from '#src/db/codes/enums';

const initiativeResponseSchema = initiativeModelSchema.omit({
  activity: true,
  permitTypeInitiativeXref: true,
  group: true
});

const permitTypeInitiativeXrefSchema = permit_type_initiative_xrefModelSchema
  .omit({ initiative: true, permitType: true })
  .extend({ initiative: initiativeResponseSchema });

// permitTypeInitiativeXref is always included by listPermitTypesService (see
// src/services/permitType.ts) but optional here since this schema is also reused for
// permit.permitType (a bare include, no xref - see permit.ts).
export const permitTypeSchema = permit_typeModelSchema
  .omit({ permit: true, sourceSystemCode: true, permitTypeInitiativeXref: true, permitTypeSourceSystemKindXref: true })
  .extend({
    permitTypeInitiativeXref: z.array(permitTypeInitiativeXrefSchema).optional(),
    // Foreign key to a code table, so the spec lists its codes; the database guarantees them
    sourceSystem: z
      .string()
      .nullable()
      .openapi({ enum: Object.values(SourceSystem) })
  })
  .openapi('PermitType');

// listPermitTypesService always includes permitTypeInitiativeXref (with nested initiative) - see
// src/services/permitType.ts - so this narrows the base schema's optional array to required.
export const permitTypeWithInitiativesSchema = permitTypeSchema
  .extend({ permitTypeInitiativeXref: z.array(permitTypeInitiativeXrefSchema) })
  .openapi('PermitTypeWithInitiatives');
