import Joi from 'joi';

import { permitTrackingSchema } from './permitTracking.ts';
import { PERMIT_STAGE_LIST } from '../utils/constants/permit.ts';

export const appliedPermit = Joi.object({
  permitTypeId: Joi.number().required(),
  stage: Joi.string()
    .valid(...PERMIT_STAGE_LIST)
    .allow(null),
  submittedDate: Joi.date().max('now').allow(null),
  permitTracking: permitTrackingSchema
});
