import Joi from 'joi';

import atsValidator from './ats';
import { email, uuidv4 } from './common';
import { contacts } from './contact';
import { validate } from '../middleware/validation';
import { electrificationProjectCategoryCodes, electrificationProjectTypeCodes } from '../utils/cache/codes';
import { APPLICATION_STATUS_LIST, INTAKE_STATUS_LIST, SUBMISSION_TYPE_LIST } from '../utils/constants/projectCommon';
import { ProjectType } from '../utils/enums/electrification';
import { IntakeStatus } from '../utils/enums/projectCommon';
import { YES_NO_LIST } from '../utils/constants/application';

const electrificationIntake = {
  activityId: Joi.string().min(8).max(8).allow(null),
  projectName: Joi.string().required().max(255).trim(),
  companyNameRegistered: Joi.string().max(255).trim().allow(null),
  projectType: Joi.string()
    .required()
    .valid(...electrificationProjectTypeCodes),
  bcHydroNumber: Joi.string().max(255).trim().allow(null),
  projectDescription: Joi.when('project.projectType', {
    is: ProjectType.OTHER,
    then: Joi.string().required().max(4000),
    otherwise: Joi.string().max(4000).allow(null)
  })
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
      intakeStatus: Joi.array().items(...INTAKE_STATUS_LIST),
      includeUser: Joi.boolean(),
      includeDeleted: Joi.boolean(),
      electrificationProjectId: Joi.array().items(uuidv4),
      projectType: Joi.array().items(...electrificationProjectTypeCodes),
      projectCategory: Joi.array().items(...electrificationProjectCategoryCodes)
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
        projectCategory: Joi.string()
          .valid(...electrificationProjectCategoryCodes)
          .allow(null),
        assignedUserId: Joi.when('intakeStatus', {
          is: IntakeStatus.SUBMITTED,
          then: uuidv4,
          otherwise: uuidv4.allow(null)
        }),
        hasEpa: Joi.string()
          .valid(...YES_NO_LIST)
          .allow(null),
        megawatts: Joi.number().positive().allow(null),
        bcEnvironmentAssessNeeded: Joi.string()
          .valid(...YES_NO_LIST)
          .allow(null),
        locationDescription: Joi.string().max(4000).allow(null),
        astNotes: Joi.string().max(4000).allow(null),
        queuePriority: Joi.number().integer().required().min(0).max(3),
        submissionType: Joi.string()
          .required()
          .valid(...SUBMISSION_TYPE_LIST),
        applicationStatus: Joi.string().valid(...APPLICATION_STATUS_LIST),
        ...atsValidator.atsEnquirySubmissionFields,
        aaiUpdated: Joi.boolean().required()
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
