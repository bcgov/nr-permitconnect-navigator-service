import { z } from 'zod';

import { appliedPermit } from './appliedPermit.ts';
import atsValidator from './ats.ts';
import { activityId, email, uuidv4 } from './common.ts';
import { contactSchema } from './contact.ts';
import { housing } from './housing';
import { validate } from '#src/middleware/validation';
import { YES_NO_UNSURE_LIST } from '#src/utils/constants/application';
import { NUM_RESIDENTIAL_UNITS_LIST, PROJECT_APPLICANT_LIST } from '#src/utils/constants/housing';
import { APPLICATION_STATUS_LIST, SUBMISSION_TYPE_LIST } from '#src/utils/constants/projectCommon';
import { BasicResponse } from '#src/utils/enums/application';
import { ProjectApplicant } from '#src/utils/enums/housing';

const unitsList = z.enum(NUM_RESIDENTIAL_UNITS_LIST as [string, ...string[]]);
const yesNoUnsure = z.enum(YES_NO_UNSURE_LIST as [string, ...string[]]);

export const schema = {
  createHousingProject: {
    body: z.object({
      draftId: uuidv4.nullish(),
      activityId: activityId.nullish(),
      contact: contactSchema.optional(),
      basic: z
        .object({
          consentToFeedback: z.boolean().optional(),
          projectApplicantType: z.enum(PROJECT_APPLICANT_LIST as [string, ...string[]]),
          projectName: z.string().max(255).trim(),
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
      housing: housing.optional(),
      location: z.unknown(),
      permits: z
        .object({
          appliedPermits: z.array(appliedPermit).nullish(),
          hasAppliedProvincialPermits: yesNoUnsure,
          investigatePermits: z.array(z.object({ permitTypeId: z.number().nullish() })).nullish()
        })
        .optional()
    })
  },
  emailConfirmation: {
    body: z.object({
      bcc: z.array(email).nullish(),
      bodyType: z.string(),
      body: z.string(),
      cc: z.array(email).optional(),
      from: email,
      subject: z.string(),
      to: z.array(email)
    })
  },
  deleteHousingProject: {
    params: z.object({
      housingProjectId: uuidv4
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
      data: z.unknown()
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
  getHousingProject: {
    params: z.object({
      housingProjectId: uuidv4
    })
  },
  searchHousingProjects: {
    body: z.object({
      activityId: z.array(z.string()).optional(),
      createdBy: z.array(z.string()).optional(),
      includeUser: z.boolean().optional(),
      housingProjectId: z.array(uuidv4).optional(),
      submissionType: z.array(z.enum(SUBMISSION_TYPE_LIST as [string, ...string[]])).optional()
    })
  },
  patchHousingProject: {
    body: z
      .object({
        consentToFeedback: z.boolean().optional(),
        financiallySupported: z.boolean().optional(),
        queuePriority: z.number().int().min(0).max(3).optional(),
        submissionType: z.enum(SUBMISSION_TYPE_LIST as [string, ...string[]]).optional(),
        companyNameRegistered: z.string().nullish(),
        companyIdRegistered: z.string().nullish(),
        projectName: z.string().optional(),
        projectDescription: z.string().nullish(),
        singleFamilyUnits: unitsList.nullish(),
        multiFamilyUnits: unitsList.nullish(),
        otherUnitsDescription: z.string().max(255).nullish(),
        otherUnits: unitsList.nullish(),
        hasRentalUnits: yesNoUnsure.optional(),
        rentalUnits: unitsList.nullish(),
        financiallySupportedBc: yesNoUnsure.optional(),
        financiallySupportedIndigenous: yesNoUnsure.optional(),
        indigenousDescription: z.string().max(255).nullish(),
        financiallySupportedNonProfit: yesNoUnsure.optional(),
        nonProfitDescription: z.string().max(255).nullish(),
        financiallySupportedHousingCoop: yesNoUnsure.optional(),
        housingCoopDescription: z.string().max(255).nullish(),
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
        ...atsValidator.atsEnquirySubmissionFields,
        ltsaCompleted: z.boolean().optional(),
        bcOnlineCompleted: z.boolean().optional(),
        aaiUpdated: z.boolean().optional(),
        astNotes: z.string().max(4000).nullish(),
        assignedUserId: uuidv4.nullish(),
        applicationStatus: z.enum(APPLICATION_STATUS_LIST as [string, ...string[]]).optional()
      })
      .strict()
      .superRefine((data, ctx) => {
        // Joi .when(..., { otherwise: allow(null) }) - deliberately not `forbidden()` here,
        // unlike housing.ts's create-time rule. Only enforce the "required when condition met" half.
        const requiredWhen: [
          boolean,
          'otherUnits' | 'rentalUnits' | 'indigenousDescription' | 'nonProfitDescription' | 'housingCoopDescription'
        ][] = [
          [data.otherUnitsDescription === BasicResponse.YES, 'otherUnits'],
          [data.hasRentalUnits === BasicResponse.YES, 'rentalUnits'],
          [data.financiallySupportedIndigenous === BasicResponse.YES, 'indigenousDescription'],
          [data.financiallySupportedNonProfit === BasicResponse.YES, 'nonProfitDescription'],
          [data.financiallySupportedHousingCoop === BasicResponse.YES, 'housingCoopDescription']
        ];
        for (const [conditionMet, field] of requiredWhen) {
          const value = data[field];
          const isEmpty = value === undefined || value === null || value === '';
          if (conditionMet && isEmpty) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: [field], message: `"${field}" is required` });
          }
        }
      }),
    params: z.object({
      housingProjectId: uuidv4
    })
  }
};

export default {
  createHousingProject: validate(schema.createHousingProject),
  emailConfirmation: validate(schema.emailConfirmation),
  deleteHousingProject: validate(schema.deleteHousingProject),
  deleteDraft: validate(schema.deleteDraft),
  upsertDraft: validate(schema.upsertDraft),
  getStatistics: validate(schema.getStatistics),
  getHousingProject: validate(schema.getHousingProject),
  patchHousingProject: validate(schema.patchHousingProject),
  searchHousingProjects: validate(schema.searchHousingProjects)
};
