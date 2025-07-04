import Joi from 'joi';

export const permitTrackingSchema = Joi.array()
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
  .allow(null);
