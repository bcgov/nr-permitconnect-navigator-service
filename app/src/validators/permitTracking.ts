import Joi from 'joi';
import { createStamps } from './stamps.ts';

export const permitTrackingSchema = Joi.array()
  .items(
    Joi.object({
      trackingId: Joi.string().allow(null),
      permitTrackingId: Joi.number().allow(null),
      shownToProponent: Joi.boolean().allow(null),
      sourceSystemKindId: Joi.number().allow(null),
      sourceSystemKind: Joi.object({}).allow(null),
      permitId: Joi.string().allow(null),
      ...createStamps
    })
  )
  .allow(null);
