import Joi from 'joi';

import { activityId, uuidv4 } from './common.ts';
import { validate } from '../middleware/validation.ts';

const noteBody = {
  createdAt: Joi.date().required(),
  activityId: activityId,
  bringForwardDate: Joi.date().iso().allow(null),
  bringForwardState: Joi.string().min(1).allow(null),
  note: Joi.string(),
  noteType: Joi.string().max(255).required(),
  title: Joi.string().max(255)
};

const schema = {
  createNote: {
    body: Joi.object(noteBody)
  },
  listNotes: {
    params: Joi.object({
      activityId: activityId
    })
  },
  updateNote: {
    body: Joi.object({
      ...noteBody,
      noteId: uuidv4.required()
    }),
    params: Joi.object({
      noteId: uuidv4.required()
    })
  }
};

export default {
  createNote: validate(schema.createNote),
  listNotes: validate(schema.listNotes),
  updateNote: validate(schema.updateNote)
};
