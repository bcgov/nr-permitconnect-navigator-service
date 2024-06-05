import Joi from 'joi';

import { applicantSchema } from './applicant';
import { appliedPermitsSchema } from './appliedPermits';
import { basicIntakeSchema } from './basic';
import { activityId, emailJoi, uuidv4 } from './common';
import { YES_NO_UNSURE } from '../components/constants';
import { housingSchema } from './housing';
import { permitsSchema } from './permits';
import { validate } from '../middleware/validation';

const schema = {
  createDraft: {
    body: Joi.object({
      applicant: applicantSchema
    })
  },
  createSubmission: {
    body: Joi.object({
      applicant: applicantSchema,
      appliedPermits: Joi.array().items(appliedPermitsSchema).allow(null),
      basic: basicIntakeSchema,
      housing: housingSchema,
      investigatePermits: Joi.array()
        .items(Joi.object({ permitTypeId: Joi.number().allow(null) }))
        .allow(null),
      permits: permitsSchema
    })
  },
  deleteSubmission: {
    params: Joi.object({
      submissionId: uuidv4.required()
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
  getSubmission: {
    params: Joi.object({
      submissionId: uuidv4.required()
    })
  },
  updateSubmission: {
    body: Joi.object({
      submissionId: uuidv4.required(),
      activityId: activityId,
      applicationStatus: Joi.string().max(255).required(),
      assignedUserId: uuidv4.allow(null),
      submittedAt: Joi.date().required(),
      submittedBy: Joi.string().max(255).allow(null),
      locationPIDs: Joi.string().min(0).max(255).allow(null),
      contactName: Joi.string().min(0).max(255).allow(null),
      contactApplicantRelationship: Joi.string().min(0).max(255).allow(null),
      contactPhoneNumber: Joi.string().min(0).max(255).allow(null),
      contactEmail: emailJoi,
      contactPreference: Joi.string().min(0).max(255).allow(null),
      projectName: Joi.string().min(0).max(255).allow(null),
      projectDescription: Joi.string().min(0).allow(null),
      companyNameRegistered: Joi.string().min(0).max(255).allow(null),
      singleFamilyUnits: Joi.string().min(0).max(255).allow(null),
      isRentalUnit: Joi.string().valid(...Object.values(YES_NO_UNSURE)),
      streetAddress: Joi.string().min(0).max(255).allow(null),
      latitude: Joi.number().max(255).allow(null),
      longitude: Joi.number().max(255).allow(null),
      queuePriority: Joi.number().max(255).allow(null),
      relatedPermits: Joi.string().max(255).allow(null),
      astNotes: Joi.string().min(0).allow(null),
      astUpdated: Joi.boolean().required(),
      addedToATS: Joi.boolean().required(),
      atsClientNumber: Joi.string().min(0).max(255).allow(null),
      ltsaCompleted: Joi.boolean().required(),
      bcOnlineCompleted: Joi.boolean().required(),
      naturalDisaster: Joi.boolean().required(),
      financiallySupported: Joi.boolean().required(),
      financiallySupportedBC: Joi.boolean().required(),
      financiallySupportedIndigenous: Joi.boolean().required(),
      financiallySupportedNonProfit: Joi.boolean().required(),
      financiallySupportedHousingCoop: Joi.boolean().required(),
      aaiUpdated: Joi.boolean().required(),
      waitingOn: Joi.string().min(0).max(255).allow(null),
      bringForwardDate: Joi.date().allow(null),
      notes: Joi.string().min(0).max(255).allow(null),
      intakeStatus: Joi.string().max(255).required(),
      guidance: Joi.boolean().required(),
      statusRequest: Joi.boolean().required(),
      inquiry: Joi.boolean().required(),
      emergencyAssist: Joi.boolean().required(),
      inapplicable: Joi.boolean().required()
    }),
    params: Joi.object({
      submissionId: uuidv4.required()
    })
  }
};

export default {
  createDraft: validate(schema.createDraft),
  createSubmission: validate(schema.createSubmission),
  deleteSubmission: validate(schema.deleteSubmission),
  getStatistics: validate(schema.getStatistics),
  getSubmission: validate(schema.getSubmission),
  updateSubmission: validate(schema.updateSubmission)
};
