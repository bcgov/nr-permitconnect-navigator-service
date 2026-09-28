import { z } from 'zod';

import '#src/schemas/openapi';
import { noteModelSchema, note_historyModelSchema } from '#prismaZod';
import { Initiative } from '#src/utils/enums/application';

const noteSchema = noteModelSchema.omit({ noteHistory: true });

// note is only included by listNoteHistories()/createNoteHistoryService, not by
// patchNoteHistoryService's findFirstOrThrow - see src/repositories/noteHistory.ts,
// src/services/noteHistory.ts.
export const noteHistorySchema = note_historyModelSchema
  .omit({ note: true, activity: true, escalationTypeCode: true })
  .extend({ note: z.array(noteSchema).optional() })
  .openapi('NoteHistory');

// Not Prisma-backed - hand-assembled in listBringForwardsService, see src/types/api/resources.ts
// BringForward interface and src/services/noteHistory.ts.
export const bringForwardSchema = z
  .object({
    activityId: z.string(),
    noteHistoryId: z.string(),
    projectId: z.string().optional(),
    enquiryId: z.string().optional(),
    initiative: z.enum(Object.values(Initiative) as [string, ...string[]]).optional(),
    title: z.string(),
    projectName: z.string().nullable(),
    bringForwardDate: z.string().optional(),
    createdByFullName: z.string().nullable(),
    escalateToSupervisor: z.boolean(),
    escalateToDirector: z.boolean()
  })
  .openapi('BringForward');
