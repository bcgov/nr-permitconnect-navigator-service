import Joi from 'joi';

import { uuidv4 } from './common.ts';
import { validate } from '../middleware/validation.ts';

const schema = {
  searchUsers: {
    query: Joi.object({
      userId: Joi.array().items(uuidv4),
      identityId: Joi.array().items(uuidv4),
      idp: Joi.array().items(Joi.string().max(255)),
      sub: Joi.string().max(255),
      email: Joi.string().max(255),
      firstName: Joi.string().max(255),
      fullName: Joi.string().max(255),
      lastName: Joi.string().max(255),
      active: Joi.string().max(255),
      group: Joi.array().items(Joi.string().max(255)),
      includeUserGroups: Joi.boolean()
    })
  }
};

export default {
  searchUsers: validate(schema.searchUsers)
};
