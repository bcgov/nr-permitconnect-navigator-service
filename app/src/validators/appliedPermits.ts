import Joi from 'joi';

import { PERMIT_STATUS } from '../components/constants';

export const appliedPermitsSchema = Joi.object({
  permitTypeId: Joi.number().required(),
  status: Joi.string()
    .valid(...Object.values(PERMIT_STATUS))
    .allow(null),
  statusLastVerified: Joi.date().allow(null),
  trackingId: Joi.string().allow(null)
});
