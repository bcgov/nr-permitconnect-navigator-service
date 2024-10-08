import Joi from 'joi';

import { YES_NO_LIST } from '../utils/constants/application';
import { ENQUIRY_TYPE_LIST } from '../utils/constants/housing';
import { BasicResponse } from '../utils/enums/application';

export const basicIntake = Joi.object({
  consentToFeedback: Joi.boolean(),
  isDevelopedByCompanyOrOrg: Joi.string()
    .required()
    .valid(...YES_NO_LIST),
  isDevelopedInBC: Joi.string()
    .required()
    .valid(...YES_NO_LIST),
  registeredName: Joi.when('isDevelopedInBC', {
    is: BasicResponse.YES,
    then: Joi.string().required().max(255).trim(),
    otherwise: Joi.forbidden()
  })
});

export const basicEnquiry = Joi.object({
  isRelated: Joi.string()
    .valid(...YES_NO_LIST)
    .required(),
  applyForPermitConnect: Joi.string().valid(...YES_NO_LIST),
  enquiryDescription: Joi.string().required(),
  relatedActivityId: Joi.string().max(255).allow(null),
  enquiryType: Joi.string()
    .valid(...ENQUIRY_TYPE_LIST)
    .allow(null)
});
