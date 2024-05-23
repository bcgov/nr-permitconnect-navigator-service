import Joi from 'joi';

import { stringRequiredMaxLengthTrim, stringRequiredYesNo } from './common';
import { YES_NO } from '../components/constants';

export const basicIntakeSchema = Joi.object({
  isDevelopedByCompanyOrOrg: stringRequiredYesNo,
  isDevelopedInBC: stringRequiredYesNo,
  registeredName: Joi.when('isDevelopedInBC', {
    is: YES_NO.YES,
    then: stringRequiredMaxLengthTrim,
    otherwise: Joi.forbidden()
  })
});

export const basicEnquirySchema = Joi.object({
  isRelated: Joi.string()
    .valid(...Object.values(YES_NO))
    .required(),
  applyForPermitConnect: Joi.string().valid(...Object.values(YES_NO)),
  enquiryDescription: Joi.string().required(),
  relatedActivityId: Joi.string().max(255)
});
