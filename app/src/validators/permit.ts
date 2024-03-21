import Joi from 'joi';

import { activityId, uuidv4 } from './common';
import { validate } from '../middleware/validation';
import { permitTypeSchema } from './permitType';

const sharedPermitSchema = {
  permitType: permitTypeSchema,
  permitTypeId: Joi.number().max(255).required(),
  activityId: activityId,
  issuedPermitId: Joi.string().min(0).max(255).allow(null),
  trackingId: Joi.string().min(0).max(255),
  authStatus: Joi.string().max(255).allow(null),
  needed: Joi.string().max(255).required(),
  status: Joi.string().max(255).required(),
  submittedDate: Joi.date().iso(),
  adjudicationDate: Joi.date().iso()
};

const schema = {
  createPermit: {
    body: Joi.object(sharedPermitSchema)
  },
  deletePermit: {
    params: Joi.object({
      permitId: uuidv4.required()
    })
  },
  listPermits: {
    params: Joi.object({
      activityId: activityId
    })
  },
  updatePermit: {
    body: Joi.object({
      ...sharedPermitSchema,
      permitId: uuidv4.required()
    }),
    params: Joi.object({
      permitId: uuidv4.required()
    })
  }
};

export default {
  createPermit: validate(schema.createPermit),
  deletePermit: validate(schema.deletePermit),
  listPermits: validate(schema.listPermits),
  updatePermit: validate(schema.updatePermit)
};
