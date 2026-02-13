import Joi from 'joi';

import { activityId, dateOnlyString, timeTzString, uuidv4 } from './common.ts';
import { validate } from '../middleware/validation.ts';
import { permitTrackingSchema } from './permitTracking.ts';
import { permitTypeSchema } from './permitType.ts';
import { createStamps } from './stamps.ts';
import { PERMIT_STAGE_LIST, PERMIT_STATE_LIST } from '../utils/constants/permit.ts';

const sharedPermitSchema = {
  permitType: permitTypeSchema,
  permitId: Joi.string().allow(null),
  permitTypeId: Joi.number().max(255).required(),
  activityId: activityId,
  issuedPermitId: Joi.string().allow(null),
  permitNote: Joi.array()
    .items(
      Joi.object({
        note: Joi.string()
      }).allow(null)
    )
    .allow(null),
  permitTracking: permitTrackingSchema,
  needed: Joi.string().max(255).required(),
  state: Joi.string()
    .max(255)
    .required()
    .valid(...PERMIT_STATE_LIST),
  stage: Joi.string()
    .max(255)
    .required()
    .valid(...PERMIT_STAGE_LIST),
  submittedDate: dateOnlyString.allow(null),
  submittedTime: timeTzString.allow(null),
  decisionDate: dateOnlyString.allow(null),
  decisionTime: timeTzString.allow(null),
  statusLastChanged: dateOnlyString.allow(null),
  statusLastChangedTime: timeTzString.allow(null),
  statusLastVerified: dateOnlyString.allow(null),
  statusLastVerifiedTime: timeTzString.allow(null),
  ...createStamps
};

export const upsertPermitBodySchema = Joi.object(sharedPermitSchema);

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
    body: upsertPermitBodySchema
  }
};

export default {
  deletePermit: validate(schema.deletePermit),
  getPermit: validate(schema.getPermit),
  listPermits: validate(schema.listPermits),
  upsertPermit: validate(schema.upsertPermit)
};
