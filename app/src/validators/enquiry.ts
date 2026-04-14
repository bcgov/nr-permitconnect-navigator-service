import Joi from 'joi';

import atsValidator from './ats.ts';
import { uuidv4 } from './common.ts';
import { contactSchema } from './contact.ts';
import { validate } from '../middleware/validation.ts';
import {
  APPLICATION_STATUS_LIST,
  ENQUIRY_SUBMITTED_METHOD,
  ENQUIRY_TYPE_LIST
} from '../utils/constants/projectCommon.ts';

const schema = {
  createEnquiry: {
    body: Joi.object({
      contact: contactSchema,
      enquiryDescription: Joi.string().required(),
      relatedActivityId: Joi.string().max(255).allow(null),
      submissionType: Joi.string()
        .valid(...ENQUIRY_TYPE_LIST)
        .allow(null),
      activityId: Joi.string(),
      enquiryId: Joi.string()
    })
  },
  deleteEnquiry: {
    params: Joi.object({
      enquiryId: uuidv4.required()
    })
  },
  searchEnquiries: {
    body: Joi.object({
      activityId: Joi.array().items(Joi.string()),
      createdBy: Joi.array().items(Joi.string()),
      enquiryId: Joi.array().items(Joi.string()),
      includeUser: Joi.boolean()
    })
  },
  updateEnquiry: {
    body: Joi.object({
      submissionType: Joi.string().allow(null),
      relatedActivityId: Joi.string().max(255).allow(null),
      enquiryDescription: Joi.string().min(0).allow(null),
      assignedUserId: uuidv4.allow(null),
      enquiryStatus: Joi.string().valid(...APPLICATION_STATUS_LIST),
      submittedMethod: Joi.string().valid(...ENQUIRY_SUBMITTED_METHOD),
      ...atsValidator.atsEnquirySubmissionFields
    })
  }
};

export default {
  createEnquiry: validate(schema.createEnquiry),
  deleteEnquiry: validate(schema.deleteEnquiry),
  searchEnquiries: validate(schema.searchEnquiries),
  updateEnquiry: validate(schema.updateEnquiry)
};
