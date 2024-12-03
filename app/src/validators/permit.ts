import Joi from 'joi';

import { activityId, uuidv4 } from './common';
import { validate } from '../middleware/validation';
import { permitTypeSchema } from './permitType';

const sharedPermitSchema = {
  permitType: permitTypeSchema,
  permitTypeId: Joi.number().max(255).required(),
  activityId: activityId,
  issuedPermitId: Joi.string().min(0).max(255).allow(null),
  trackingId: Joi.string().min(0).max(255).allow(null),
  authStatus: Joi.string().max(255).allow(null),
  statusLastVerified: Joi.date().iso().max('now'),
  needed: Joi.string().max(255).required(),
  status: Joi.string().max(255).required(),
  submittedDate: Joi.date().iso().max('now'),
  adjudicationDate: Joi.date().iso().max('now')
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
  getPermit: {
    params: Joi.object({
      permitId: uuidv4.required()
    })
  },
  listPermits: {
    query: Joi.object({
      activityId: Joi.string().min(8).max(8).allow(null),
      includeNotes: Joi.boolean().allow(null)
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
  getPermit: validate(schema.getPermit),
  listPermits: validate(schema.listPermits),
  updatePermit: validate(schema.updatePermit)
};
