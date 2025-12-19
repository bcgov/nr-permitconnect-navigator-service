import Joi from 'joi';

import { appliedPermit } from './appliedPermit.ts';
import atsValidator from './ats.ts';
import { basicIntake } from './basic.ts';
import { activityId, email, uuidv4 } from './common.ts';
import { contactSchema } from './contact.ts';

import { housing } from './housing.ts';
import { permits } from './permits.ts';
import { validate } from '../middleware/validation.ts';
import { YES_NO_LIST, YES_NO_UNSURE_LIST } from '../utils/constants/application.ts';
import { NUM_RESIDENTIAL_UNITS_LIST } from '../utils/constants/housing.ts';
import { APPLICATION_STATUS_LIST, INTAKE_STATUS_LIST, SUBMISSION_TYPE_LIST } from '../utils/constants/projectCommon.ts';
import { BasicResponse } from '../utils/enums/application.ts';

const schema = {
  createHousingProject: {
    body: Joi.object({
      draftId: uuidv4.allow(null),
      activityId: Joi.string().min(8).max(8).allow(null),
      contact: contactSchema,
      appliedPermits: Joi.array().items(appliedPermit).allow(null),
      basic: basicIntake,
      housing: housing,
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
  deleteHousingProject: {
    params: Joi.object({
      housingProjectId: uuidv4.required()
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
  getHousingProject: {
    params: Joi.object({
      housingProjectId: uuidv4.required()
    })
  },
  searchHousingProjects: {
    query: Joi.object({
      activityId: Joi.array().items(Joi.string()),
      createdBy: Joi.array().items(Joi.string()),
      includeUser: Joi.boolean(),
      housingProjectId: Joi.array().items(uuidv4),
      submissionType: Joi.array().items(...SUBMISSION_TYPE_LIST)
    })
  },
  updateHousingProject: {
    body: Joi.object({
      housingProjectId: uuidv4.required(),
      activityId: activityId,
      consentToFeedback: Joi.boolean(),
      queuePriority: Joi.number().required().integer().min(0).max(3),
      submissionType: Joi.string()
        .required()
        .valid(...SUBMISSION_TYPE_LIST),
      submittedAt: Joi.string().required(),
      companyNameRegistered: Joi.string().allow(null),
      companyIdRegistered: Joi.string().allow(null),
      isDevelopedInBc: Joi.when('companyNameRegistered', {
        is: Joi.string().required(),
        then: Joi.string()
          .required()
          .valid(...YES_NO_LIST),
        otherwise: Joi.string().allow(null)
      }),
      projectName: Joi.string().required(),
      projectDescription: Joi.string().allow(null),
      singleFamilyUnits: Joi.string()
        .allow(null)
        .valid(...NUM_RESIDENTIAL_UNITS_LIST),
      multiFamilyUnits: Joi.string()
        .allow(null)
        .valid(...NUM_RESIDENTIAL_UNITS_LIST),
      otherUnitsDescription: Joi.string().allow(null).max(255),
      otherUnits: Joi.when('otherUnitsDescription', {
        is: BasicResponse.YES,
        then: Joi.string()
          .required()
          .valid(...NUM_RESIDENTIAL_UNITS_LIST),
        otherwise: Joi.string().allow(null)
      }),
      hasRentalUnits: Joi.string()
        .required()
        .valid(...YES_NO_UNSURE_LIST),
      rentalUnits: Joi.when('hasRentalUnits', {
        is: BasicResponse.YES,
        then: Joi.string()
          .required()
          .valid(...NUM_RESIDENTIAL_UNITS_LIST),
        otherwise: Joi.string().allow(null)
      }),
      financiallySupportedBc: Joi.string()
        .required()
        .valid(...YES_NO_UNSURE_LIST),
      financiallySupportedIndigenous: Joi.string()
        .required()
        .valid(...YES_NO_UNSURE_LIST),
      indigenousDescription: Joi.when('financiallySupportedIndigenous', {
        is: BasicResponse.YES,
        then: Joi.string().required().max(255),
        otherwise: Joi.string().allow(null)
      }),
      financiallySupportedNonProfit: Joi.string()
        .required()
        .valid(...YES_NO_UNSURE_LIST),
      nonProfitDescription: Joi.when('financiallySupportedNonProfit', {
        is: BasicResponse.YES,
        then: Joi.string().required().max(255),
        otherwise: Joi.string().allow(null)
      }),
      financiallySupportedHousingCoop: Joi.string()
        .required()
        .valid(...YES_NO_UNSURE_LIST),
      housingCoopDescription: Joi.when('financiallySupportedHousingCoop', {
        is: BasicResponse.YES,
        then: Joi.string().required().max(255),
        otherwise: Joi.string().allow(null)
      }),
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
      housingProjectId: uuidv4.required()
    })
  }
};

export default {
  createHousingProject: validate(schema.createHousingProject),
  emailConfirmation: validate(schema.emailConfirmation),
  deleteHousingProject: validate(schema.deleteHousingProject),
  deleteDraft: validate(schema.deleteDraft),
  getStatistics: validate(schema.getStatistics),
  getHousingProject: validate(schema.getHousingProject),
  searcHousingProjects: validate(schema.searchHousingProjects),
  updateHousingProject: validate(schema.updateHousingProject)
};
