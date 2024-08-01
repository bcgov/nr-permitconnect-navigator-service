import Joi from 'joi';

import { uuidv4 } from './common';
import { validate } from '../middleware/validation';

const schema = {
  userAccessRevokeRequest: {
    body: Joi.object({
      user: Joi.object({
        userId: uuidv4.allow(null),
        identityId: uuidv4.required(),
        idp: Joi.string().max(255).required(),
        username: Joi.string().max(255).required(),
        email: Joi.string().max(255).required(),
        firstName: Joi.string().max(255).required(),
        fullName: Joi.string().max(255).required(),
        lastName: Joi.string().max(255).required(),
        active: Joi.string().max(255).allow(null)
      }),
      accessRequest: Joi.object({
        accessRequestId: uuidv4.allow(null),
        userId: uuidv4.allow(null),
        grant: Joi.boolean().required(),
        role: Joi.string().max(255).allow(null),
        status: Joi.string().max(255).allow(null)
      })
    })
  }
};

export default {
  userAccessRevokeRequest: validate(schema.userAccessRevokeRequest)
};
