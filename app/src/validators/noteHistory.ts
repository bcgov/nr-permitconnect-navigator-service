import { z } from 'zod';

import { activityId, uuidv4 } from './common.ts';
import { requireValidCode } from '#src/db/codes/validator';
import { validate } from '#src/middleware/validation';
import { BRING_FORWARD_TYPE_LIST } from '#src/utils/constants/projectCommon';
import { Resource } from '#src/utils/enums/application';

const bringForwardState = z.enum(BRING_FORWARD_TYPE_LIST as [string, ...string[]]);

export const schema = {
  deleteNoteHistory: {
    params: z
      .object({
        noteHistoryId: uuidv4
      })
      .strict()
  },
  createNoteHistory: {
    body: z
      .object({
        activityId: activityId,
        bringForwardDate: z.coerce.date().nullish(),
        bringForwardState: bringForwardState.nullish(),
        escalateToSupervisor: z.boolean().optional(),
        escalateToDirector: z.boolean().optional(),
        escalationType: requireValidCode.EscalationType(z.string()).nullish(),
        note: z.string().min(1),
        shownToProponent: z.boolean().optional(),
        title: z.string().min(1).max(255),
        type: z.string().min(1).max(255)
      })
      .strict()
  },
  listBringForwards: {
    query: z
      .object({
        bringForwardState: bringForwardState.optional()
      })
      .strict()
  },
  listNoteHistory: {
    params: z
      .object({
        activityId: activityId
      })
      .strict()
  },
  patchNoteHistory: {
    body: z
      .object({
        bringForwardDate: z.coerce.date().nullish(),
        bringForwardState: bringForwardState.nullish(),
        escalateToSupervisor: z.boolean().optional(),
        escalateToDirector: z.boolean().optional(),
        escalationType: requireValidCode.EscalationType(z.string()).nullish(),
        note: z.string().nullish(),
        resource: z.enum([
          Resource.ELECTRIFICATION_PROJECT,
          Resource.ENQUIRY,
          Resource.GENERAL_PROJECT,
          Resource.HOUSING_PROJECT
        ] as [Resource, ...Resource[]]),
        shownToProponent: z.boolean().optional(),
        title: z.string().max(255).optional(),
        type: z.string().max(255).optional()
      })
      .strict(),
    params: z
      .object({
        noteHistoryId: uuidv4
      })
      .strict()
  }
};

export default {
  deleteNoteHistory: validate(schema.deleteNoteHistory),
  createNoteHistory: validate(schema.createNoteHistory),
  listBringForwards: validate(schema.listBringForwards),
  listNoteHistory: validate(schema.listNoteHistory),
  patchNoteHistory: validate(schema.patchNoteHistory)
};
