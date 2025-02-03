import Joi from 'joi';

import { basicEnquiry } from './basic';
import { uuidv4 } from './common';
import { contacts } from './contact';
import { validate } from '../middleware/validation';
import { APPLICATION_STATUS_LIST, INTAKE_STATUS_LIST } from '../utils/constants/housing';

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
  updateEnquiry: {
    body: Joi.object({
      enquiryId: Joi.string().required(),
      activityId: Joi.string().required(),
      enquiryType: Joi.string().allow(null),
      submittedAt: Joi.date(),
      submittedBy: Joi.string().max(255).required(),
      relatedActivityId: Joi.string().max(255).allow(null),
      enquiryDescription: Joi.string().min(0).allow(null),
      intakeStatus: Joi.string()
        .valid(...Object.values(INTAKE_STATUS_LIST))
        .allow(null),
      assignedUserId: uuidv4.allow(null),
      enquiryStatus: Joi.string().valid(...APPLICATION_STATUS_LIST),
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
  updateIsDeletedFlag: validate(schema.updateIsDeletedFlag),
  updateEnquiry: validate(schema.updateEnquiry)
};
