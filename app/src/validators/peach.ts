import Joi from 'joi';

import { validate } from '../middleware/validation.ts';
import { createStamps } from './stamps.ts';

const schema = {
  getPeachSummary: {
    body: Joi.object({
      permitTrackings: Joi.array()
        .min(1)
        .required()
        .items(
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
    })
  }
};

export default {
  getPeachSummary: validate(schema.getPeachSummary)
};
