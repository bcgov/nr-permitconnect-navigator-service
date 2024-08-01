import Joi from 'joi';

import { uuidv4 } from './common';
import { validate } from '../middleware/validation';

const schema = {
  searchUsers: {
    query: Joi.object({
      userId: Joi.array().items(uuidv4),
      identityId: Joi.array().items(uuidv4),
      idp: Joi.array().items(Joi.string().max(255)),
      username: Joi.string().max(255),
      email: Joi.string().max(255),
      firstName: Joi.string().max(255),
      fullName: Joi.string().max(255),
      lastName: Joi.string().max(255),
      active: Joi.string().max(255),
      role: Joi.string().max(255)
    })
  }
};

export default {
  searchUsers: validate(schema.searchUsers)
};
