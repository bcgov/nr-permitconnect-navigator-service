import Joi from 'joi';

import { applicant } from './applicant';
import { basicEnquiry } from './basic';
import { email, phoneNumber, uuidv4 } from './common';
import { validate } from '../middleware/validation';
import { YES_NO_LIST } from '../utils/constants/application';
import {
  APPLICATION_STATUS_LIST,
  CONTACT_PREFERENCE_LIST,
  INTAKE_STATUS_LIST,
  PROJECT_RELATIONSHIP_LIST
} from '../utils/constants/housing';

const schema = {
  createEnquiry: {
    body: Joi.object({
      applicant: applicant,
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
      contacts: Joi.array()
        .items(
          Joi.object({
            contactId: uuidv4.allow(null),
            userId: uuidv4.allow(null),
            contactPreference: Joi.string().valid(...CONTACT_PREFERENCE_LIST),
            email: email.required(),
            firstName: Joi.string().required().max(255),
            lastName: Joi.string().required().max(255),
            phoneNumber: phoneNumber.required(),
            contactApplicantRelationship: Joi.string()
              .required()
              .valid(...PROJECT_RELATIONSHIP_LIST)
          })
        )
        .allow(null),
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
