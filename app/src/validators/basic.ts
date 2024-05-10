import Joi from 'joi';

import { YES_NO } from '../components/constants';

export const basicSchema = Joi.object({
  isDevelopedByCompanyOrOrg: Joi.string()
    .valid(...Object.values(YES_NO))
    .required(),
  isDevelopedInBC: Joi.string()
    .valid(...Object.values(YES_NO))
    .required(),
  registeredName: Joi.string().when('isDevelopedInBC', {
    is: YES_NO.YES,
    then: Joi.string().max(255).required(),
    otherwise: Joi.forbidden()
  })
});
