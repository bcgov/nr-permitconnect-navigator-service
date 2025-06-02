import Joi from 'joi';

import atsValidator from './ats';
import { basicEnquiry } from './basic';
import { uuidv4 } from './common';
import { contacts } from './contact';
import { validate } from '../middleware/validation';
import { ENQUIRY_SUBMITTED_METHOD } from '../utils/constants/projectCommon';
import { APPLICATION_STATUS_LIST, INTAKE_STATUS_LIST } from '../utils/constants/projectCommon';

const schema = {
  createEnquiry: {
    body: Joi.object({
      contacts: contacts,
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
  updateIsDeletedFlag: {
    params: Joi.object({
      enquiryId: uuidv4.required()
    }),
    body: Joi.object({
      isDeleted: Joi.boolean().required()
    })
  },
  searchEnquiries: {
    query: Joi.object({
      activityId: Joi.array().items(Joi.string()),
      createdBy: Joi.array().items(Joi.string()),
      enquiryId: Joi.array().items(Joi.string()),
      intakeStatus: Joi.array().items(Joi.string()),
      includeDeleted: Joi.boolean(),
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
      intakeStatus: Joi.string()
        .valid(...Object.values(INTAKE_STATUS_LIST))
        .allow(null),
      assignedUserId: uuidv4.allow(null),
      enquiryStatus: Joi.string().valid(...APPLICATION_STATUS_LIST),
      submittedMethod: Joi.string().valid(...ENQUIRY_SUBMITTED_METHOD),
      ...atsValidator.atsEnquirySubmissionFields,
      waitingOn: Joi.string().allow(null).max(255),
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
  updateIsDeletedFlag: validate(schema.updateIsDeletedFlag),
  updateEnquiry: validate(schema.updateEnquiry)
};
