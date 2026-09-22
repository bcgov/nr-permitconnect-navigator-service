import { z } from 'zod';

import '#src/schemas/openapi';
import { PermitStage, PermitState, PiesOnHold } from '#src/db/codes/enums';

// Not Prisma-backed - hand-assembled in parsers/peach.ts's summarizePiesRecord from PEACH event
// data, see src/parsers/peach.ts.
export const peachSummarySchema = z
  .object({
    stage: z.enum(Object.values(PermitStage) as [string, ...string[]]),
    state: z.enum(Object.values(PermitState) as [string, ...string[]]),
    onHoldCode: z.enum(Object.values(PiesOnHold) as [string, ...string[]]).optional(),
    submittedDate: z.string().nullable(),
    submittedTime: z.string().nullable(),
    decisionDate: z.string().nullable(),
    decisionTime: z.string().nullable(),
    statusLastChanged: z.string(),
    statusLastChangedTime: z.string().nullable()
  })
  .openapi('PeachSummary');
