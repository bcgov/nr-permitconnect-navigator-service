import Joi from 'joi';

import { permitTrackingSchema } from './permitTracking';
import { PERMIT_STAGE_LIST } from '../utils/constants/permit';

export const appliedPermit = Joi.object({
  permitTypeId: Joi.number().required(),
  stage: Joi.string()
    .valid(...PERMIT_STAGE_LIST)
    .allow(null),
  submittedDate: Joi.date().max('now').allow(null),
  permitTracking: permitTrackingSchema
});
