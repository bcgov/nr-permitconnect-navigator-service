import Joi from 'joi';

import { activityId, uuidv4 } from './common.ts';
import { validate } from '../middleware/validation.ts';
import { escalationTypeCodes } from '../utils/cache/codes.ts';
import { BRING_FORWARD_TYPE_LIST } from '../utils/constants/projectCommon.ts';

const schema = {
  createNoteHistory: {
    body: Joi.object({
      activityId: activityId,
      bringForwardDate: Joi.date().iso().allow(null),
      bringForwardState: Joi.string()
        .valid(...BRING_FORWARD_TYPE_LIST)
        .allow(null),
      escalateToSupervisor: Joi.boolean(),
      escalateToDirector: Joi.boolean(),
      escalationType: Joi.string()
        .valid(...escalationTypeCodes)
        .allow(null),
      note: Joi.string().required(),
      shownToProponent: Joi.boolean(),
      title: Joi.string().max(255).required(),
      type: Joi.string().max(255).required()
    })
  },
  listNoteHistory: {
    params: Joi.object({
      activityId: activityId
    })
  },
  updateNoteHistory: {
    body: Joi.object({
      activityId: activityId,
      bringForwardDate: Joi.date().iso().allow(null),
      bringForwardState: Joi.string()
        .valid(...BRING_FORWARD_TYPE_LIST)
        .allow(null),
      escalateToSupervisor: Joi.boolean(),
      escalateToDirector: Joi.boolean(),
      escalationType: Joi.string()
        .valid(...escalationTypeCodes)
        .allow(null),
      note: Joi.string().allow(null),
      noteHistoryId: uuidv4.allow(null),
      resource: Joi.string().required(),
      shownToProponent: Joi.boolean(),
      title: Joi.string().max(255).required(),
      type: Joi.string().max(255).required()
    }),
    params: Joi.object({
      noteHistoryId: uuidv4.required()
    })
  }
};

export default {
  createNoteHistory: validate(schema.createNoteHistory),
  listNoteHistory: validate(schema.listNoteHistory),
  updateNoteHistory: validate(schema.updateNoteHistory)
};
