import Joi from 'joi';

import { permitTrackingSchema } from './permitTracking';
import { PERMIT_STATUS_LIST } from '../utils/constants/permit';

export const appliedPermit = Joi.object({
  permitTypeId: Joi.number().required(),
  status: Joi.string()
    .valid(...PERMIT_STATUS_LIST)
    .allow(null),
  submittedDate: Joi.date().max('now').allow(null),
  permitTracking: permitTrackingSchema
});
