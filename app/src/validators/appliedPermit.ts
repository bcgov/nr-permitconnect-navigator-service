import Joi from 'joi';

import { permitTrackingSchema } from './permitTracking.ts';
import { requireValidCode } from '#src/db/codes/validator';

export const appliedPermit = Joi.object({
  permitTypeId: Joi.number().required(),
  stage: Joi.string().custom(requireValidCode.PermitStage).allow(null),
  submittedDate: Joi.date().max('now').allow(null),
  permitTracking: permitTrackingSchema
});
