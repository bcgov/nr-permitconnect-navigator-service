import { z } from 'zod';

import '#src/validators/openapi';
import { access_requestModelSchema } from '#prismaZod';

// group is excluded from zod generation (RBAC-adjacent model) - hand-written to match its scalar
// columns as returned by Prisma's `include: { group: true }`.
const groupSchema = z.object({
  groupId: z.number(),
  initiativeId: z.string(),
  name: z.string(),
  label: z.string(),
  createdBy: z.string().nullable(),
  createdAt: z.date().nullable(),
  updatedBy: z.string().nullable(),
  updatedAt: z.date().nullable(),
  deletedBy: z.string().nullable(),
  deletedAt: z.date().nullable()
});

// user relation isn't selected - see src/services/accessRequest.ts.
export const accessRequestSchema = access_requestModelSchema
  .omit({ user: true })
  .extend({ group: groupSchema })
  .openapi('AccessRequest');
