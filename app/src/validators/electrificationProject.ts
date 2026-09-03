import { z } from 'zod';

import atsValidator from './ats.ts';
import { activityId, uuidv4 } from './common.ts';
import { contactSchema } from './contact.ts';
import { requireValidCode } from '#src/db/codes/validator';
import { validate } from '#src/middleware/validation';
import { YES_NO_LIST } from '#src/utils/constants/application';
import { APPLICATION_STATUS_LIST, SUBMISSION_TYPE_LIST } from '#src/utils/constants/projectCommon';
import { ProjectType } from '#src/utils/enums/electrification';

export const schema = {
  createElectrificationProject: {
    body: z
      .object({
        activityId: activityId.nullish(),
        basic: z
          .object({
            projectDescription: z.string().max(4000).nullish(),
            projectName: z.string().max(255).trim(),
            registeredId: z.string().max(255).trim().nullish(),
            registeredName: z.string().max(255).trim().nullish()
          })
          .strict()
          .optional(),
        contact: contactSchema.optional(),
        draftId: uuidv4.nullish(),
        project: z
          .object({
            bcHydroNumber: z.string().max(255).trim().nullish(),
            projectType: requireValidCode.ElectrificationProjectType(z.string())
          })
          .strict()
          .optional()
      })
      .strict()
      .superRefine((data, ctx) => {
        const isOther = data.project?.projectType === ProjectType.OTHER;
        const value = data.basic?.projectDescription;
        const isEmpty = value === undefined || value === null || value === '';
        if (isOther && isEmpty) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['basic', 'projectDescription'],
            message: '"projectDescription" is required'
          });
        }
      })
      .default({})
  },
  deleteElectrificationProject: {
    params: z
      .object({
        electrificationProjectId: uuidv4
      })
      .strict()
  },
  deleteDraft: {
    params: z
      .object({
        draftId: uuidv4
      })
      .strict()
  },
  upsertDraft: {
    body: z
      .object({
        draftId: uuidv4.nullish(),
        data: z.unknown().refine((value) => value !== undefined, { message: '"data" is required' })
      })
      .strict()
  },
  getStatistics: {
    query: z
      .object({
        dateFrom: z.coerce.date().nullish(),
        dateTo: z.coerce.date().nullish(),
        monthYear: z.coerce.date().nullish(),
        userId: uuidv4.nullish()
      })
      .strict()
  },
  getElectrificationProject: {
    params: z
      .object({
        electrificationProjectId: uuidv4
      })
      .strict()
  },
  searchElectrificationProjects: {
    body: z
      .object({
        activityId: z.array(z.string()).optional(),
        createdBy: z.array(z.string()).optional(),
        includeUser: z.boolean().optional(),
        electrificationProjectId: z.array(uuidv4).optional(),
        projectType: z.array(requireValidCode.ElectrificationProjectType(z.string())).optional(),
        projectCategory: z.array(requireValidCode.ElectrificationProjectCategory(z.string())).optional()
      })
      .strict()
      .default({})
  },
  patchElectrificationProject: {
    body: z
      .object({
        projectName: z.string().max(255).trim().optional(),
        companyNameRegistered: z.string().max(255).trim().nullish(),
        companyIdRegistered: z.string().max(255).trim().nullish(),
        projectType: requireValidCode.ElectrificationProjectType(z.string()).optional(),
        bcHydroNumber: z.string().max(255).trim().nullish(),
        projectDescription: z.string().max(4000).nullish(),
        projectCategory: requireValidCode.ElectrificationProjectCategory(z.string()).nullish(),
        assignedUserId: uuidv4.nullish(),
        hasEpa: z.enum(YES_NO_LIST as [string, ...string[]]).nullish(),
        megawatts: z.number().positive().nullish(),
        bcEnvironmentAssessNeeded: z.enum(YES_NO_LIST as [string, ...string[]]).nullish(),
        locationDescription: z.string().max(4000).nullish(),
        astNotes: z.string().max(4000).nullish(),
        queuePriority: z.number().int().min(0).max(3).optional(),
        submissionType: z.enum(SUBMISSION_TYPE_LIST as [string, ...string[]]).optional(),
        applicationStatus: z.enum(APPLICATION_STATUS_LIST as [string, ...string[]]).optional(),
        ...atsValidator.atsEnquirySubmissionFields,
        aaiUpdated: z.boolean().optional()
      })
      .strict()
      .superRefine((data, ctx) => {
        const isOther = data.projectType === ProjectType.OTHER;
        const value = data.projectDescription;
        const isEmpty = value === undefined || value === null || value === '';
        if (isOther && isEmpty) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['projectDescription'],
            message: '"projectDescription" is required'
          });
        }
      }),
    params: z
      .object({
        electrificationProjectId: uuidv4
      })
      .strict()
  }
};

export default {
  createElectrificationProject: validate(schema.createElectrificationProject),
  deleteElectrificationProject: validate(schema.deleteElectrificationProject),
  deleteDraft: validate(schema.deleteDraft),
  upsertDraft: validate(schema.upsertDraft),
  getStatistics: validate(schema.getStatistics),
  getElectrificationProject: validate(schema.getElectrificationProject),
  searcElectrificationProjects: validate(schema.searchElectrificationProjects),
  patchElectrificationProject: validate(schema.patchElectrificationProject)
};
