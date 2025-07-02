import Joi from 'joi';

import { activityId, uuidv4 } from './common';
import { validate } from '../middleware/validation';
import { BRING_FORWARD_TYPE_LIST } from '../utils/constants/projectCommon';

const noteHistoryBody = {
  activityId: activityId,
  bringForwardDate: Joi.date().iso().allow(null),
  bringForwardState: Joi.string()
    .valid(...BRING_FORWARD_TYPE_LIST)
    .allow(null),
  escalateToSupervisor: Joi.boolean(),
  escalateToDirector: Joi.boolean(),
  noteHistoryId: uuidv4.allow(null),
  shownToProponent: Joi.boolean(),
  title: Joi.string().max(255).required(),
  type: Joi.string().max(255).required()
};

const noteBody = {
  noteId: uuidv4.allow(null),
  noteHistoryId: uuidv4.allow(null),
  note: Joi.string()
};

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
  addNote: {
    body: Joi.object({
      note: Joi.string().required()
    }),
    params: Joi.object({
      noteHistoryId: uuidv4.required()
    })
  }
};

export default {
  createNoteHistory: validate(schema.createNoteHistory),
  listNoteHistory: validate(schema.listNoteHistory),
  addNote: validate(schema.addNote)
};
