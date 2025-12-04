import Joi from 'joi';

import { validate } from '../middleware/validation';

const schema = {
  permitTrackings: {
    body: Joi.array().items(
      Joi.object({
        trackingId: Joi.string().required(),
        shownToProponent: Joi.boolean().allow(null),
        sourceSystemKindId: Joi.number().required(),
        sourceSystemKind: Joi.object({
          sourceSystem: Joi.string().required(),
          description: Joi.string().required(),
          sourceSystemKindId: Joi.number().required()
        }).required()
      })
    )
  }
};

export default {
  permitTrackings: validate(schema.permitTrackings)
};
