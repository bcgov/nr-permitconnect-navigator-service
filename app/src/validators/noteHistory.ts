import { z } from 'zod';

import { activityId, uuidv4 } from './common.ts';
import { requireValidCode } from '#src/db/codes/validator';
import { validate } from '#src/middleware/validation';
import { BRING_FORWARD_TYPE_LIST } from '#src/utils/constants/projectCommon';
import { Resource } from '#src/utils/enums/application';

const bringForwardState = z.enum(BRING_FORWARD_TYPE_LIST as [string, ...string[]]);

export const schema = {
  deleteNoteHistory: {
    params: z.object({
      noteHistoryId: uuidv4
    })
  },
  createNoteHistory: {
    body: z.object({
      activityId: activityId,
      bringForwardDate: z.coerce.date().nullish(),
      bringForwardState: bringForwardState.nullish(),
      escalateToSupervisor: z.boolean().optional(),
      escalateToDirector: z.boolean().optional(),
      escalationType: requireValidCode.EscalationType(z.string()).nullish(),
      note: z.string(),
      shownToProponent: z.boolean().optional(),
      title: z.string().max(255),
      type: z.string().max(255)
    })
  },
  listBringForwards: {
    query: z.object({
      bringForwardState: bringForwardState.optional()
    })
  },
  listNoteHistory: {
    params: z.object({
      activityId: activityId
    })
  },
  patchNoteHistory: {
    body: z.object({
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
    }),
    params: z.object({
      noteHistoryId: uuidv4
    })
  }
};

export default {
  deleteNoteHistory: validate(schema.deleteNoteHistory),
  createNoteHistory: validate(schema.createNoteHistory),
  listBringForwards: validate(schema.listBringForwards),
  listNoteHistory: validate(schema.listNoteHistory),
  patchNoteHistory: validate(schema.patchNoteHistory)
};
