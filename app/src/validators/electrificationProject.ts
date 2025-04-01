import Joi from 'joi';

import { email, uuidv4 } from './common';
import { contacts } from './contact';
import { validate } from '../middleware/validation';
import { PROJECT_TYPES } from '../utils/constants/electrification';
import { IntakeStatus } from '../utils/enums/projectCommon';

const electrificationIntake = {
  activityId: Joi.string().min(8).max(8).allow(null),
  projectName: Joi.string().required().max(255).trim(),
  projectDescription: Joi.string().max(4000).allow(null),
  companyNameRegistered: Joi.string().required().max(255).trim(),
  projectType: Joi.string()
    .required()
    .valid(...PROJECT_TYPES),
  bcHydroNumber: Joi.string().required().max(255).trim().allow(null)
};

const schema = {
  createElectrificationProject: {
    body: Joi.object({
      draftId: uuidv4.allow(null),
      contacts: contacts,
      project: {
        ...electrificationIntake
      }
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
  deleteElectrificationProject: {
    params: Joi.object({
      electrificationProjectId: uuidv4.required()
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
  getElectrificationProject: {
    params: Joi.object({
      electrificationProjectId: uuidv4.required()
    })
  },
  searchElectrificationProjects: {
    query: Joi.object({
      activityId: Joi.array().items(Joi.string()),
      createdBy: Joi.array().items(Joi.string()),
      includeUser: Joi.boolean(),
      includeDeleted: Joi.boolean(),
      electrificationProjectId: Joi.array().items(uuidv4)
    })
  },
  updateIsDeletedFlag: {
    params: Joi.object({
      electrificationProjectId: uuidv4.required()
    }),
    body: Joi.object({
      isDeleted: Joi.boolean().required()
    })
  },
  updateElectrificationProject: {
    body: Joi.object({
      contacts: contacts,
      project: {
        ...electrificationIntake,
        electrificationProjectId: uuidv4.required(),
        submittedAt: Joi.string().required(),
        assignedUserId: Joi.when('intakeStatus', {
          is: IntakeStatus.SUBMITTED,
          then: uuidv4,
          otherwise: uuidv4.allow(null)
        })
      }
    }),
    params: Joi.object({
      electrificationProjectId: uuidv4.required()
    })
  }
};

export default {
  createElectrificationProject: validate(schema.createElectrificationProject),
  emailConfirmation: validate(schema.emailConfirmation),
  deleteElectrificationProject: validate(schema.deleteElectrificationProject),
  deleteDraft: validate(schema.deleteDraft),
  getStatistics: validate(schema.getStatistics),
  getElectrificationProject: validate(schema.getElectrificationProject),
  searcElectrificationProjects: validate(schema.searchElectrificationProjects),
  updateIsDeletedFlag: validate(schema.updateIsDeletedFlag),
  updateElectrificationProject: validate(schema.updateElectrificationProject)
};
