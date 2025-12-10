import Joi from 'joi';

import { validate } from '../middleware/validation';
import { createStamps } from './stamps';

const schema = {
  permitTrackings: {
    body: Joi.array().items(
      Joi.object({
        trackingId: Joi.string().allow(null),
        permitTrackingId: Joi.number().allow(null),
        permitId: Joi.string().allow(null),
        shownToProponent: Joi.boolean().allow(null),
        sourceSystemKindId: Joi.number().allow(null),
        sourceSystemKind: Joi.object({
          sourceSystemKindId: Joi.number().required(),
          description: Joi.string().required(),
          integrated: Joi.boolean(),
          kind: Joi.string().allow(null),
          sourceSystem: Joi.string().required(),
          ...createStamps
        }).required(),
        ...createStamps
      })
    )
  }
};

export default {
  permitTrackings: validate(schema.permitTrackings)
};
