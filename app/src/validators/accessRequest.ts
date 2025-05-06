import Joi from 'joi';

import { uuidv4 } from './common';
import { validate } from '../middleware/validation';

const schema = {
  createUserAccessRequest: {
    body: Joi.object({
      user: Joi.object({
        userId: uuidv4.allow(null),
        idp: Joi.string().max(255).required(),
        sub: Joi.string().max(255).required(),
        email: Joi.string().max(255).required(),
        firstName: Joi.string().max(255).required(),
        fullName: Joi.string().max(255).required(),
        lastName: Joi.string().max(255).required(),
        active: Joi.boolean()
      }),
      accessRequest: Joi.object({
        accessRequestId: uuidv4.allow(null),
        userId: uuidv4.allow(null),
        grant: Joi.boolean().required(),
        groupId: Joi.when('grant', {
          is: true,
          then: Joi.number().required(),
          otherwise: Joi.number().allow(null)
        }),
        status: Joi.string().max(255).allow(null),
        update: Joi.boolean().allow(null)
      })
    })
  },

  processUserAccessRequest: {
    params: Joi.object({
      accessRequestId: uuidv4
    }),
    body: Joi.object({
      approve: Joi.boolean().required()
    })
  }
};

export default {
  createUserAccessRequest: validate(schema.createUserAccessRequest),
  processUserAccessRequest: validate(schema.processUserAccessRequest)
};
