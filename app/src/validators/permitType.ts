import Joi from 'joi';

export const permitTypeSchema = Joi.object({
  permitTypeId: Joi.number().max(255).required(),
  agency: Joi.string().max(255).required(),
  division: Joi.string().max(255).allow(null),
  branch: Joi.string().max(255).allow(null),
  businessDomain: Joi.string().max(255).allow(null),
  type: Joi.string().max(255).required(),
  family: Joi.string().max(255).allow(null),
  name: Joi.string().max(255).required(),
  nameSubtype: Joi.string().max(255).allow(null),
  acronym: Joi.string().max(255).allow(null),
  trackedInAts: Joi.boolean().required(),
  sourceSystem: Joi.string().max(255).allow(null),
  sourceSystemAcronym: Joi.string().max(255).allow(null)
});
