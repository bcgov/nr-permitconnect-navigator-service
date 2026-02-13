import Joi from 'joi';

import { appliedPermit } from './appliedPermit.ts';
import atsValidator from './ats.ts';
import { basicIntake } from './basic.ts';
import { activityId, email, uuidv4 } from './common.ts';
import { contactSchema } from './contact.ts';

import { permits } from './permits';
import { validate } from '../middleware/validation';
import { APPLICATION_STATUS_LIST, SUBMISSION_TYPE_LIST } from '../utils/constants/projectCommon';

const schema = {
  createGeneralProject: {
    body: Joi.object({
      draftId: uuidv4.allow(null),
      activityId: Joi.string().min(8).max(8).allow(null),
      contact: contactSchema,
      appliedPermits: Joi.array().items(appliedPermit).allow(null),
      basic: basicIntake,
      general: Joi.object({
        projectName: Joi.string().required().max(255).trim(),
        projectDescription: Joi.string().max(4000).allow(null)
      }),
      location: Joi.any(),
      investigatePermits: Joi.array()
        .items(Joi.object({ permitTypeId: Joi.number().allow(null) }))
        .allow(null),
      permits: permits
    })
  },
  emailConfirmation: {
    body: Joi.object({
      bcc: Joi.array().items(email).allow(null),
      bodyType: Joi.string().required().allow(null),
      body: Joi.string().required(),
      cc: Joi.array().items(email),
      from: email.required(),
      subject: Joi.string().required(),
      to: Joi.array().items(email).required()
    })
  },
  deleteGeneralProject: {
    params: Joi.object({
      generalProjectId: uuidv4.required()
    })
  },
  deleteDraft: {
    params: Joi.object({
      draftId: uuidv4.required()
    })
  },
  getStatistics: {
    query: Joi.object({
      dateFrom: Joi.date().allow(null),
      dateTo: Joi.date().allow(null),
      monthYear: Joi.date().allow(null),
      userId: uuidv4.allow(null)
    })
  },
  getGeneralProject: {
    params: Joi.object({
      generalProjectId: uuidv4.required()
    })
  },
  searchGeneralProjects: {
    query: Joi.object({
      activityId: Joi.array().items(Joi.string()),
      createdBy: Joi.array().items(Joi.string()),
      includeUser: Joi.boolean(),
      generalProjectId: Joi.array().items(uuidv4),
      submissionType: Joi.array().items(...SUBMISSION_TYPE_LIST)
    })
  },
  updateGeneralProject: {
    body: Joi.object({
      generalProjectId: uuidv4.required(),
      activityId: activityId,
      consentToFeedback: Joi.boolean(),
      queuePriority: Joi.number().required().integer().min(0).max(3),
      submissionType: Joi.string()
        .required()
        .valid(...SUBMISSION_TYPE_LIST),
      submittedAt: Joi.string().required(),
      companyNameRegistered: Joi.string().allow(null),
      companyIdRegistered: Joi.string().allow(null),
      projectName: Joi.string().required(),
      projectDescription: Joi.string().allow(null),
      streetAddress: Joi.string().allow(null).max(255),
      locality: Joi.string().allow(null).max(255),
      province: Joi.string().allow(null).max(255),
      locationPids: Joi.string().allow(null).max(255),
      latitude: Joi.number().allow(null).max(255),
      longitude: Joi.number().allow(null).max(255),
      geomarkUrl: Joi.string().allow(null).max(255),
      naturalDisaster: Joi.boolean().required(),
      projectLocationDescription: Joi.string().allow(null).max(4000),
      ...atsValidator.atsEnquirySubmissionFields,
      ltsaCompleted: Joi.boolean().required(),
      bcOnlineCompleted: Joi.boolean().required(),
      aaiUpdated: Joi.boolean().required(),
      astNotes: Joi.string().allow(null).max(4000),
      assignedUserId: uuidv4.allow(null),
      applicationStatus: Joi.string().valid(...APPLICATION_STATUS_LIST)
    }),
    params: Joi.object({
      generalProjectId: uuidv4.required()
    })
  }
};

export default {
  createGeneralProject: validate(schema.createGeneralProject),
  emailConfirmation: validate(schema.emailConfirmation),
  deleteGeneralProject: validate(schema.deleteGeneralProject),
  deleteDraft: validate(schema.deleteDraft),
  getStatistics: validate(schema.getStatistics),
  getGeneralProject: validate(schema.getGeneralProject),
  searchGeneralProjects: validate(schema.searchGeneralProjects),
  updateGeneralProject: validate(schema.updateGeneralProject)
};
