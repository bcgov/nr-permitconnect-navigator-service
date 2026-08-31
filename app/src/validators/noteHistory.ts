import Joi from 'joi';

import { activityId, uuidv4 } from './common.ts';
import { requireValidCode } from '#src/db/codes/validator';
import { validate } from '#src/middleware/validation';
import { BRING_FORWARD_TYPE_LIST } from '#src/utils/constants/projectCommon';
import { Resource } from '#src/utils/enums/application';

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
      escalationType: Joi.string().custom(requireValidCode.EscalationType).allow(null),
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
  patchNoteHistory: {
    body: Joi.object({
      bringForwardDate: Joi.date().iso().allow(null),
      bringForwardState: Joi.string()
        .valid(...BRING_FORWARD_TYPE_LIST)
        .allow(null),
      escalateToSupervisor: Joi.boolean(),
      escalateToDirector: Joi.boolean(),
      escalationType: Joi.string().custom(requireValidCode.EscalationType).allow(null),
      note: Joi.string().allow(null),
      resource: Joi.string()
        .required()
        .valid(Resource.ELECTRIFICATION_PROJECT, Resource.ENQUIRY, Resource.GENERAL_PROJECT, Resource.HOUSING_PROJECT),
      shownToProponent: Joi.boolean(),
      title: Joi.string().max(255),
      type: Joi.string().max(255)
    }),
    params: Joi.object({
      noteHistoryId: uuidv4.required()
    })
  }
};

export default {
  createNoteHistory: validate(schema.createNoteHistory),
  listNoteHistory: validate(schema.listNoteHistory),
  patchNoteHistory: validate(schema.patchNoteHistory)
};
