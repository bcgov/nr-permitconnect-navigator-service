import Joi from 'joi';

import { PERMIT_STATUS_LIST } from '../utils/constants/permit';

export const appliedPermit = Joi.object({
  permitTypeId: Joi.number().required(),
  status: Joi.string()
    .valid(...PERMIT_STATUS_LIST)
    .allow(null),
  submittedDate: Joi.date().max('now').allow(null),
  permitTracking: Joi.array()
    .items(
      Joi.object({
        trackingId: Joi.string().allow(null),
        permitTrackingId: Joi.string().allow(null),
        shownToProponent: Joi.boolean().allow(null),
        sourceSystemKindId: Joi.number().allow(null),
        sourceSystemKind: Joi.object({}).allow(null),
        permitId: Joi.string().allow(null)
      })
    )
    .allow(null)
});
