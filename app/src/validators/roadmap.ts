import Joi from 'joi';

import { activityId, email, uuidv4 } from './common';
import { validate } from '../middleware/validation.ts';

const schema = {
  send: {
    body: Joi.object({
      activityId: activityId,
      selectedFileIds: Joi.array().items(uuidv4),
      emailData: Joi.object().keys({
        bcc: Joi.array().items(email),
        bodyType: Joi.string().required(),
        body: Joi.string().required(),
        cc: Joi.array().items(email),
        delayTS: Joi.number(),
        from: email.required(),
        priority: Joi.string(),
        subject: Joi.string().required(),
        tag: Joi.string(),
        to: Joi.array().items(email).required()
      })
    })
  }
};

export default {
  send: validate(schema.send)
};
