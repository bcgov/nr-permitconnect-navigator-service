import Joi from 'joi';

import { activityId, emailJoi, uuidv4 } from './common';
import { validate } from '../middleware/validation';

const schema = {
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
      activityId: activityId
    })
  },
  updateSubmission: {
    body: Joi.object({
      submissionId: uuidv4.required(),
      activityId: activityId,
      applicationStatus: Joi.string().max(255).required(),
      assignedUserId: uuidv4.required(),
      projectName: Joi.string().min(0).max(255).allow(null),
      submittedAt: Joi.date().required(),
      submittedBy: Joi.string().max(255).allow(null),
      locationPIDs: Joi.string().min(0).max(255).allow(null),
      contactName: Joi.string().min(0).max(255).allow(null),
      contactPhoneNumber: Joi.string().min(0).max(255).allow(null),
      contactEmail: emailJoi,
      companyNameRegistered: Joi.string().min(0).max(255).allow(null),
      singleFamilyUnits: Joi.string().min(0).max(255).allow(null),
      streetAddress: Joi.string().min(0).max(255).allow(null),
      latitude: Joi.number().max(255).allow(null),
      longitude: Joi.number().max(255).allow(null),
      queuePriority: Joi.number().max(255).allow(null),
      relatedPermits: Joi.string().max(255).allow(null),
      astNotes: Joi.string().min(0).max(255).allow(null),
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
  getStatistics: validate(schema.getStatistics),
  getSubmission: validate(schema.getSubmission),
  updateSubmission: validate(schema.updateSubmission)
};
