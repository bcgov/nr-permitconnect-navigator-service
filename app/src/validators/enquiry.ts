import Joi from 'joi';

import atsValidator from './ats.ts';
import { basicEnquiry } from './basic.ts';
import { uuidv4 } from './common.ts';
import { contacts, contactSchema } from './contact.ts';
import { validate } from '../middleware/validation.ts';
import { ENQUIRY_SUBMITTED_METHOD } from '../utils/constants/projectCommon.ts';
import { APPLICATION_STATUS_LIST } from '../utils/constants/projectCommon.ts';

const schema = {
  createEnquiry: {
    body: Joi.object({
      contact: contactSchema,
      basic: basicEnquiry,
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
      enquiryId: Joi.string().required(),
      activityId: Joi.string().required(),
      submissionType: Joi.string().allow(null),
      submittedAt: Joi.date(),
      submittedBy: Joi.string().max(255).required(),
      relatedActivityId: Joi.string().max(255).allow(null),
      enquiryDescription: Joi.string().min(0).allow(null),
      assignedUserId: uuidv4.allow(null),
      enquiryStatus: Joi.string().valid(...APPLICATION_STATUS_LIST),
      submittedMethod: Joi.string().valid(...ENQUIRY_SUBMITTED_METHOD),
      ...atsValidator.atsEnquirySubmissionFields,
      contacts: contacts,
      createdAt: Joi.date().allow(null),
      createdBy: Joi.string().allow(null),
      updatedAt: Joi.date().allow(null),
      updatedBy: Joi.string().allow(null)
    })
  }
};

export default {
  createEnquiry: validate(schema.createEnquiry),
  deleteEnquiry: validate(schema.deleteEnquiry),
  searchEnquiries: validate(schema.searchEnquiries),
  updateEnquiry: validate(schema.updateEnquiry)
};
