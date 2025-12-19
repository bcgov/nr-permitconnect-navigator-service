import Joi from 'joi';

import { YES_NO_LIST } from '../utils/constants/application.ts';
import { PROJECT_APPLICANT_LIST } from '../utils/constants/housing.ts';
import { ENQUIRY_TYPE_LIST } from '../utils/constants/projectCommon.ts';
import { ProjectApplicant } from '../utils/enums/housing.ts';

export const basicIntake = Joi.object({
  consentToFeedback: Joi.boolean(),
  projectApplicantType: Joi.string()
    .required()
    .valid(...PROJECT_APPLICANT_LIST),
  isDevelopedInBc: Joi.when('projectApplicantType', {
    is: ProjectApplicant.BUSINESS,
    then: Joi.string()
      .required()
      .valid(...YES_NO_LIST),
    otherwise: Joi.string().allow(null)
  }),
  registeredId: Joi.string().allow(null),
  registeredName: Joi.when('projectApplicantType', {
    is: ProjectApplicant.BUSINESS,
    then: Joi.string().required().max(255).trim(),
    otherwise: Joi.string().allow(null)
  })
});

export const basicEnquiry = Joi.object({
  enquiryDescription: Joi.string().required(),
  relatedActivityId: Joi.string().max(255).allow(null),
  submissionType: Joi.string()
    .valid(...ENQUIRY_TYPE_LIST)
    .allow(null)
});
