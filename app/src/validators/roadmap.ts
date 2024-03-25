import Joi from 'joi';

import { activityId, emailJoi } from './common';
import { validate } from '../middleware/validation';

const schema = {
  send: {
    body: Joi.object({
      activityId: activityId,
      emailData: Joi.object().keys({
        // attachments: Joi.object().keys({
        //   content: Joi.string().required(),
        //   contentType: Joi.string(),
        //   encoding: Joi.string(),
        //   filename: Joi.string().required(),
        // }),
        bcc: Joi.array().items(emailJoi),
        bodyType: Joi.string().required(),
        body: Joi.string().required(),
        cc: Joi.array().items(emailJoi),
        delayTS: Joi.number(),
        from: emailJoi.required(),
        priority: Joi.string(),
        subject: Joi.string().required(),
        tag: Joi.string(),
        to: Joi.array().items(emailJoi).required()
      })
    })
  }
};

export default {
  send: validate(schema.send)
};
