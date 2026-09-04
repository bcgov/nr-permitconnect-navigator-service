import { z } from 'zod';

import { appliedPermit } from './appliedPermit.ts';
import atsValidator from './ats.ts';
import { activityId, uuidv4 } from './common.ts';
import { location } from './location.ts';
import { submittedContactSchema } from './submittedContact.ts';
import { requireValidCode } from '#src/db/codes/validator';
import { validate } from '#src/middleware/validation';
import { YES_NO_UNSURE_LIST } from '#src/utils/constants/application';
import { PROJECT_APPLICANT_LIST } from '#src/utils/constants/housing';
import { APPLICATION_STATUS_LIST, SUBMISSION_TYPE_LIST } from '#src/utils/constants/projectCommon';
import { ProjectApplicant } from '#src/utils/enums/housing';

export const schema = {
  // POST / always sends an empty body (frontend creates a blank project, then fills it in via patch).
  createGeneralProject: {
    body: z.object({}).strict().default({})
  },
  // POST /draft/submit carries the full intake payload from the general ProjectIntakeForm.vue.
  submitGeneralProjectDraft: {
    body: z
      .object({
        draftId: uuidv4.nullish(),
        activityId: activityId.nullish(),
        contact: submittedContactSchema,
        basic: z
          .object({
            projectApplicantType: z.enum(PROJECT_APPLICANT_LIST as [string, ...string[]]),
            projectName: z.string().max(255).trim(),
            projectNumber: z.string().max(255).trim().optional(),
            projectDescription: z.string().max(4000),
            registeredId: z.string().nullish(),
            registeredName: z.string().nullish()
          })
          .strict()
          .superRefine((data, ctx) => {
            const isBusiness = data.projectApplicantType === ProjectApplicant.BUSINESS;
            const value = data.registeredName;
            const isEmpty = value === undefined || value === null || value === '';
            if (isBusiness && isEmpty) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['registeredName'],
                message: '"registeredName" is required'
              });
            }
          }),
        location,
        permits: z
          .object({
            appliedPermits: z.array(appliedPermit).nullish(),
            hasAppliedProvincialPermits: z.enum(YES_NO_UNSURE_LIST as [string, ...string[]]),
            investigatePermits: z.array(z.object({ permitTypeId: z.number() }).strict()).nullish()
          })
          .strict()
      })
      .strict()
  },
  deleteGeneralProject: {
    params: z
      .object({
        generalProjectId: uuidv4
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
  getGeneralProject: {
    params: z
      .object({
        generalProjectId: uuidv4
      })
      .strict()
  },
  searchGeneralProjects: {
    body: z
      .object({
        activityId: z.array(z.string()).optional(),
        createdBy: z.array(z.string()).optional(),
        includeUser: z.boolean().optional(),
        generalProjectId: z.array(uuidv4).optional(),
        submissionType: z.array(z.enum(SUBMISSION_TYPE_LIST as [string, ...string[]])).optional()
      })
      .strict()
      .default({})
  },
  patchGeneralProject: {
    body: z
      .object({
        queuePriority: z.number().int().min(0).max(3).optional(),
        submissionType: z.enum(SUBMISSION_TYPE_LIST as [string, ...string[]]).optional(),
        companyNameRegistered: z.string().nullish(),
        companyIdRegistered: z.string().nullish(),
        projectName: z.string().optional(),
        activityType: z.string().optional(),
        projectDescription: z.string().nullish(),
        streetAddress: z.string().max(255).nullish(),
        locality: z.string().max(255).nullish(),
        province: z.string().max(255).nullish(),
        locationPids: z.string().max(255).nullish(),
        latitude: z.number().max(255).nullish(),
        longitude: z.number().max(255).nullish(),
        geomarkUrl: z.string().max(255).nullish(),
        geoJson: z.unknown().optional(),
        naturalDisaster: z.boolean().optional(),
        projectLocationDescription: z.string().max(4000).nullish(),
        atsClientId: atsValidator.atsEnquirySubmissionFields.atsClientId,
        atsEnquiryId: atsValidator.atsEnquirySubmissionFields.atsEnquiryId,
        aaiUpdated: z.boolean().optional(),
        astNotes: z.string().max(4000).nullish(),
        assignedUserId: uuidv4.nullish(),
        applicationStatus: z.enum(APPLICATION_STATUS_LIST as [string, ...string[]]).optional(),
        region: z.string().nullish(),
        area: z.string().nullish(),
        businessArea: requireValidCode.BusinessArea(z.string()).nullish()
      })
      .strict(),
    params: z
      .object({
        generalProjectId: uuidv4
      })
      .strict()
  }
};

export default {
  createGeneralProject: validate(schema.createGeneralProject),
  submitGeneralProjectDraft: validate(schema.submitGeneralProjectDraft),
  deleteGeneralProject: validate(schema.deleteGeneralProject),
  deleteDraft: validate(schema.deleteDraft),
  upsertDraft: validate(schema.upsertDraft),
  getStatistics: validate(schema.getStatistics),
  getGeneralProject: validate(schema.getGeneralProject),
  searchGeneralProjects: validate(schema.searchGeneralProjects),
  patchGeneralProject: validate(schema.patchGeneralProject)
};
