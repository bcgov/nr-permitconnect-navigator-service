import Joi from 'joi';

import { ENQUIRY_TYPE_LIST } from '../utils/constants/projectCommon';

export const basicEnquiry = Joi.object({
  enquiryDescription: Joi.string().required(),
  relatedActivityId: Joi.string().max(255).allow(null),
  submissionType: Joi.string()
    .valid(...ENQUIRY_TYPE_LIST)
    .allow(null)
});
