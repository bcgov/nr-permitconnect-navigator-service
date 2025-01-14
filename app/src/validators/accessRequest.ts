import Joi from 'joi';

import { uuidv4 } from './common.ts';
import { validate } from '../middleware/validation.ts';

const schema = {
  createUserAccessRequest: {
    body: Joi.object({
      user: Joi.object({
        userId: uuidv4.allow(null),
        identityId: uuidv4.required(),
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
        group: Joi.when('grant', {
          is: true,
          then: Joi.string().max(255).required(),
          otherwise: Joi.string().max(255).allow(null)
        }),
        status: Joi.string().max(255).allow(null)
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
