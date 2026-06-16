import Joi from 'joi';

import { validate } from '../middleware/validation.ts';
import { Initiative } from '../utils/enums/application';

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
  infoUrl: Joi.string().max(255).allow(null),
  trackedInAts: Joi.boolean().required(),
  sourceSystem: Joi.string().max(255).allow(null),
  sourceSystemAcronym: Joi.string().max(255).allow(null)
});

const schema = {
  listPermitTypes: {
    query: Joi.object({
      initiative: Joi.string()
        .valid(...Object.keys(Initiative))
        .allow(null)
    })
  }
};

export default {
  listPermitTypes: validate(schema.listPermitTypes)
};
