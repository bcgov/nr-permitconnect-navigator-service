import { z } from 'zod';

import '#src/schemas/openapi';
import { initiativeModelSchema, permit_typeModelSchema, permit_type_initiative_xrefModelSchema } from '#prismaZod';

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
// permit.permitType (a bare include, no xref - see permitSchema.ts) and as a request-body
// field (see validators/permit.ts, which layers its own stricter field constraints on top).
export const permitTypeSchema = permit_typeModelSchema
  .omit({ permit: true, sourceSystemCode: true, permitTypeInitiativeXref: true, permitTypeSourceSystemKindXref: true })
  .extend({ permitTypeInitiativeXref: z.array(permitTypeInitiativeXrefSchema).optional() })
  .openapi('PermitType');
