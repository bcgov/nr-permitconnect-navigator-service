import Joi from 'joi';

import { activityId, uuidv4 } from './common';
import { validate } from '../middleware/validation';
import { ActivityContactRole } from '../utils/enums/projectCommon';

const schema = {
  createActivityContact: {
    params: Joi.object({
      activityId: activityId,
      contactId: uuidv4
    }),
    body: Joi.object({
      role: Joi.string()
        .required()
        .valid(...Object.values(ActivityContactRole))
    })
  },

  deleteActivityContact: {
    params: Joi.object({
      activityId: activityId,
      contactId: uuidv4
    })
  },

  listActivityContact: {
    params: Joi.object({
      activityId: activityId
    })
  },

  updateActivityContact: {
    params: Joi.object({
      activityId: activityId,
      contactId: uuidv4
    }),
    body: Joi.object({
      role: Joi.string()
        .required()
        .valid(...Object.values(ActivityContactRole))
    })
  }
};

export default {
  createActivityContact: validate(schema.createActivityContact),
  deleteActivityContact: validate(schema.deleteActivityContact),
  listActivityContact: validate(schema.listActivityContact),
  updateActivityContact: validate(schema.updateActivityContact)
};
