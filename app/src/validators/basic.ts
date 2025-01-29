import Joi from 'joi';

import { YES_NO_LIST } from '../utils/constants/application';
import { ENQUIRY_TYPE_LIST, PROJECT_APPLICANT_LIST } from '../utils/constants/housing';
import { ProjectApplicant } from '../utils/enums/housing';

export const basicIntake = Joi.object({
  consentToFeedback: Joi.boolean(),
  projectApplicantType: Joi.string()
    .required()
    .valid(...PROJECT_APPLICANT_LIST),
  isDevelopedInBC: Joi.when('projectApplicantType', {
    is: ProjectApplicant.BUSINESS,
    then: Joi.string()
      .required()
      .valid(...YES_NO_LIST),
    otherwise: Joi.string().allow(null)
  }),
  registeredName: Joi.when('projectApplicantType', {
    is: ProjectApplicant.BUSINESS,
    then: Joi.string().required().max(255).trim(),
    otherwise: Joi.string().allow(null)
  })
});

export const basicEnquiry = Joi.object({
  enquiryDescription: Joi.string().required(),
  relatedActivityId: Joi.string().max(255).allow(null),
  enquiryType: Joi.string()
    .valid(...ENQUIRY_TYPE_LIST)
    .allow(null)
});
