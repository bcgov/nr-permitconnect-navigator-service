import Joi from 'joi';

import { applicant } from './applicant';
import { basicEnquiry } from './basic';
import { email, phoneNumber, uuidv4 } from './common';
import { validate } from '../middleware/validation';
import { YES_NO_LIST } from '../utils/constants/application';
import { APPLICATION_STATUS_LIST, INTAKE_STATUS_LIST } from '../utils/constants/housing';

const schema = {
  createDraft: {
    body: Joi.object({
      applicant: applicant,
      basic: basicEnquiry,
      submit: Joi.boolean()
    })
  },
  deleteEnquiry: {
    params: Joi.object({
      enquiryId: uuidv4.required()
    })
  },
  updateDraft: {
    body: Joi.object({
      applicant: applicant,
      basic: basicEnquiry,
      submit: Joi.boolean(),
      enquiryId: Joi.string().required(),
      activityId: Joi.string().required()
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
      contactFirstName: Joi.string().max(255).required(),
      contactLastName: Joi.string().max(255).required(),
      contactPhoneNumber: phoneNumber,
      contactEmail: email.required(),
      contactPreference: Joi.string().max(255).required(),
      contactApplicantRelationship: Joi.string().max(255).required(),
      isRelated: Joi.string()
        .valid(...Object.values(YES_NO_LIST))
        .allow(null),
      relatedActivityId: Joi.string().max(255).allow(null),
      enquiryDescription: Joi.string().min(0).allow(null),
      applyForPermitConnect: Joi.string()
        .valid(...Object.values(YES_NO_LIST))
        .allow(null),
      intakeStatus: Joi.string()
        .valid(...Object.values(INTAKE_STATUS_LIST))
        .allow(null),
      assignedUserId: uuidv4.allow(null),
      enquiryStatus: Joi.string().valid(...APPLICATION_STATUS_LIST),
      waitingOn: Joi.string().allow(null).max(255),
      createdAt: Joi.date().allow(null),
      createdBy: Joi.string().allow(null),
      updatedAt: Joi.date().allow(null),
      updatedBy: Joi.string().allow(null)
    })
  }
};

export default {
  createDraft: validate(schema.createDraft),
  deleteEnquiry: validate(schema.deleteEnquiry),
  updateDraft: validate(schema.updateDraft),
  updateIsDeletedFlag: validate(schema.updateIsDeletedFlag),
  updateEnquiry: validate(schema.updateEnquiry)
};
