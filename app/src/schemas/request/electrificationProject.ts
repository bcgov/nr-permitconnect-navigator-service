import { z } from 'zod';

import { intakePermits } from './appliedPermit.ts';
import { atsEnquirySubmissionFields } from './ats.ts';
import { activityId, uuidv4 } from './common.ts';
import { paginationOptions } from './paginationOptions.ts';
import { submittedContactSchema } from './submittedContact.ts';
import { requireValidCode } from '#src/db/codes/validator';
import { YES_NO_LIST } from '#src/utils/constants/application';
import { APPLICATION_STATUS_LIST, SUBMISSION_TYPE_LIST } from '#src/utils/constants/projectCommon';

export const schema = {
  // POST / always sends an empty body (frontend creates a blank project, then fills it in via patch).
  createElectrificationProject: {
    body: z.object({}).strict().default({})
  },
  // POST /draft/submit carries the full intake payload from ProjectIntakeForm.vue.
  submitElectrificationProjectDraft: {
    body: z
      .object({
        activityId: activityId.nullish(),
        basic: z
          .object({
            projectDescription: z.string().trim().min(1).max(4000),
            projectName: z.string().max(255).trim(),
            registeredId: z.string().max(255).trim().nullish(),
            registeredName: z.string().max(255).trim()
          })
          .strict(),
        contact: submittedContactSchema,
        draftId: uuidv4.nullish(),
        project: z
          .object({
            bcHydroNumber: z.string().max(255).trim().nullish(),
            projectType: requireValidCode.ElectrificationProjectType(z.string())
          })
          .strict(),
        permits: intakePermits
      })
      .strict()
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
  getDraft: {
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
        dateRange: z.array(z.string()).length(2).nullish().optional(),
        includeUser: z.boolean().optional(),
        electrificationProjectId: z.array(uuidv4).optional(),
        applicationStatus: z.array(z.string()).optional(),
        searchTag: z.string().optional(),
        projectType: z.array(requireValidCode.ElectrificationProjectType(z.string())).optional(),
        projectCategory: z.array(requireValidCode.ElectrificationProjectCategory(z.string())).optional()
      })
      .merge(paginationOptions)
      .strict()
  },
  patchElectrificationProject: {
    body: z
      .object({
        projectName: z.string().max(255).trim().optional(),
        companyNameRegistered: z.string().max(255).trim().nullish(),
        companyIdRegistered: z.string().max(255).trim().nullish(),
        projectType: requireValidCode.ElectrificationProjectType(z.string()).optional(),
        bcHydroNumber: z.string().max(255).trim().nullish(),
        projectDescription: z.string().trim().min(1).max(4000).optional(),
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
        ...atsEnquirySubmissionFields,
        aaiUpdated: z.boolean().optional()
      })
      .strict(),
    params: z
      .object({
        electrificationProjectId: uuidv4
      })
      .strict()
  }
};
