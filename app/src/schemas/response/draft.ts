import { z } from 'zod';

import { activityBaseSchema } from './activity.ts';
import { activityContactBaseSchema } from './activityContact.ts';
import '#src/schemas/openapi';
import { draftModelSchema } from '#prismaZod';

import type { Prisma } from '#prismaClient';

// activity.activityContact as included by get/list draft (no nested .contact) - see
// src/services/draft.ts for the include shape this mirrors.
const activityForDraftSchema = activityBaseSchema.extend({
  activityContact: z.array(activityContactBaseSchema)
});

export const draftSchema = draftModelSchema
  // draft_code isn't generated (excluded as a non-API-facing model) and is never included anyway.
  .omit({ draftCodeDraftDraftCodeTodraftCode: true, data: true })
  .extend({
    activity: activityForDraftSchema.optional(),
    // data is a Json column - the generated pure model stubs it as z.unknown(), which doesn't
    // match Prisma's own JsonValue type used at the write side (see domains/draft.ts). z.custom()
    // has no introspectable shape, so it needs an explicit .openapi() type or OpenApiGeneratorV3
    // throws UnknownZodTypeError when building the spec - see tests/unit/schemas/openapi.test.ts.
    data: z.custom<Prisma.JsonValue>().openapi({ type: 'object' })
  })
  .openapi('Draft');
