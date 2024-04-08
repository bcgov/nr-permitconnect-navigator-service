import Joi from 'joi';

import { activityId } from './common';
import { validate } from '../middleware/validation';

const schema = {
  createNote: {
    body: Joi.object({
      createdAt: Joi.date().required(),
      activityId: activityId,
      bringForwardDate: Joi.date().iso().allow(null),
      bringForwardState: Joi.string().min(1).allow(null),
      note: Joi.string(),
      noteType: Joi.string().max(255).required(),
      title: Joi.string().max(255)
    })
  },
  listNotes: {
    params: Joi.object({
      activityId: activityId
    })
  }
};

export default {
  createNote: validate(schema.createNote),
  listNotes: validate(schema.listNotes)
};
