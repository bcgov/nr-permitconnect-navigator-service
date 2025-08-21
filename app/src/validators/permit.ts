import Joi from 'joi';

import { activityId, uuidv4 } from './common';
import { validate } from '../middleware/validation';
import { permitTrackingSchema } from './permitTracking';
import { permitTypeSchema } from './permitType';
import { createStamps } from './stamps';

const sharedPermitSchema = {
  permitType: permitTypeSchema,
  permitId: Joi.string().allow(null),
  permitTypeId: Joi.number().max(255).required(),
  activityId: activityId,
  issuedPermitId: Joi.string().allow(null),
  permitTracking: permitTrackingSchema,
  authStatus: Joi.string().max(255).allow(null),
  statusLastVerified: Joi.date().iso().max('now').allow(null),
  needed: Joi.string().max(255).required(),
  status: Joi.string().max(255).required(),
  submittedDate: Joi.date().iso().max('now'),
  adjudicationDate: Joi.date().iso().max('now'),
  ...createStamps
};

const schema = {
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
  upsertPermit: {
    body: Joi.object(sharedPermitSchema)
  }
};

export default {
  deletePermit: validate(schema.deletePermit),
  getPermit: validate(schema.getPermit),
  listPermits: validate(schema.listPermits),
  upsertPermit: validate(schema.upsertPermit)
};
