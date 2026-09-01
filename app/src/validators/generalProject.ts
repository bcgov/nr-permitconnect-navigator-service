import { z } from 'zod';

import { appliedPermit } from './appliedPermit.ts';
import atsValidator from './ats.ts';
import { activityId, uuidv4 } from './common.ts';
import { contactSchema } from './contact.ts';
import { requireValidCode } from '#src/db/codes/validator';
import { validate } from '#src/middleware/validation';
import { YES_NO_UNSURE_LIST } from '#src/utils/constants/application';
import { PROJECT_APPLICANT_LIST } from '#src/utils/constants/housing';
import { APPLICATION_STATUS_LIST, SUBMISSION_TYPE_LIST } from '#src/utils/constants/projectCommon';
import { ProjectApplicant } from '#src/utils/enums/housing';

export const schema = {
  createGeneralProject: {
    body: z.object({
      draftId: uuidv4.nullish(),
      activityId: activityId.nullish(),
      contact: contactSchema.optional(),
      basic: z
        .object({
          projectApplicantType: z.enum(PROJECT_APPLICANT_LIST as [string, ...string[]]),
          projectName: z.string().max(255).trim(),
          projectNumber: z.string().max(255).trim().optional(),
          projectDescription: z.string().max(4000).nullish(),
          registeredId: z.string().nullish(),
          registeredName: z.string().nullish()
        })
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
        })
        .optional(),
      general: z
        .object({
          projectName: z.string().max(255).trim(),
          projectDescription: z.string().max(4000).nullish()
        })
        .optional(),
      location: z.unknown(),
      permits: z
        .object({
          appliedPermits: z.array(appliedPermit).nullish(),
          hasAppliedProvincialPermits: z.enum(YES_NO_UNSURE_LIST as [string, ...string[]]),
          investigatePermits: z.array(z.object({ permitTypeId: z.number().nullish() })).nullish()
        })
        .optional()
    })
  },
  deleteGeneralProject: {
    params: z.object({
      generalProjectId: uuidv4
    })
  },
  deleteDraft: {
    params: z.object({
      draftId: uuidv4
    })
  },
  upsertDraft: {
    body: z.object({
      draftId: uuidv4.nullish(),
      data: z.unknown().refine((value) => value !== undefined, { message: '"data" is required' })
    })
  },
  getStatistics: {
    query: z.object({
      dateFrom: z.coerce.date().nullish(),
      dateTo: z.coerce.date().nullish(),
      monthYear: z.coerce.date().nullish(),
      userId: uuidv4.nullish()
    })
  },
  getGeneralProject: {
    params: z.object({
      generalProjectId: uuidv4
    })
  },
  searchGeneralProjects: {
    body: z.object({
      activityId: z.array(z.string()).optional(),
      createdBy: z.array(z.string()).optional(),
      includeUser: z.boolean().optional(),
      generalProjectId: z.array(uuidv4).optional(),
      submissionType: z.array(z.enum(SUBMISSION_TYPE_LIST as [string, ...string[]])).optional()
    })
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
    params: z.object({
      generalProjectId: uuidv4
    })
  }
};

export default {
  createGeneralProject: validate(schema.createGeneralProject),
  deleteGeneralProject: validate(schema.deleteGeneralProject),
  deleteDraft: validate(schema.deleteDraft),
  upsertDraft: validate(schema.upsertDraft),
  getStatistics: validate(schema.getStatistics),
  getGeneralProject: validate(schema.getGeneralProject),
  searchGeneralProjects: validate(schema.searchGeneralProjects),
  patchGeneralProject: validate(schema.patchGeneralProject)
};
