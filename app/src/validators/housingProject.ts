import { z } from 'zod';

import { appliedPermit } from './appliedPermit.ts';
import atsValidator from './ats.ts';
import { activityId, uuidv4 } from './common.ts';
import { contactSchema } from './contact.ts';
import { housing } from './housing';
import { location } from './location.ts';
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
    body: z
      .object({
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
          })
          .optional(),
        housing: housing.optional(),
        location: location.optional(),
        permits: z
          .object({
            appliedPermits: z.array(appliedPermit).nullish(),
            hasAppliedProvincialPermits: yesNoUnsure,
            investigatePermits: z.array(z.object({ permitTypeId: z.number().nullish() }).strict()).nullish()
          })
          .strict()
          .optional()
      })
      .strict()
      .default({})
  },
  deleteHousingProject: {
    params: z
      .object({
        housingProjectId: uuidv4
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
  getHousingProject: {
    params: z
      .object({
        housingProjectId: uuidv4
      })
      .strict()
  },
  searchHousingProjects: {
    body: z
      .object({
        activityId: z.array(z.string()).optional(),
        createdBy: z.array(z.string()).optional(),
        includeUser: z.boolean().optional(),
        housingProjectId: z.array(uuidv4).optional(),
        submissionType: z.array(z.enum(SUBMISSION_TYPE_LIST as [string, ...string[]])).optional()
      })
      .strict()
      .default({})
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
        otherUnits: z.string().max(255).nullish(),
        hasRentalUnits: yesNoUnsure.optional(),
        rentalUnits: z.string().max(255).nullish(),
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
        // each field is required, and constrained to allowedValues if given, only when its "Yes" flag is set
        const unitsValues = NUM_RESIDENTIAL_UNITS_LIST as readonly string[];
        const requiredWhen: [
          boolean,
          'otherUnits' | 'rentalUnits' | 'indigenousDescription' | 'nonProfitDescription' | 'housingCoopDescription',
          readonly string[] | undefined
        ][] = [
          [data.otherUnitsDescription === BasicResponse.YES, 'otherUnits', unitsValues],
          [data.hasRentalUnits === BasicResponse.YES, 'rentalUnits', unitsValues],
          [data.financiallySupportedIndigenous === BasicResponse.YES, 'indigenousDescription', undefined],
          [data.financiallySupportedNonProfit === BasicResponse.YES, 'nonProfitDescription', undefined],
          [data.financiallySupportedHousingCoop === BasicResponse.YES, 'housingCoopDescription', undefined]
        ];
        for (const [conditionMet, field, allowedValues] of requiredWhen) {
          if (!conditionMet) continue;
          const value = data[field];
          const isEmpty = value === undefined || value === null || value === '';
          if (isEmpty) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: [field], message: `"${field}" is required` });
          } else if (allowedValues && !allowedValues.includes(value)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: [field],
              message: `"${field}" must be one of [${allowedValues.join(', ')}]`
            });
          }
        }
      }),
    params: z
      .object({
        housingProjectId: uuidv4
      })
      .strict()
  }
};

export default {
  createHousingProject: validate(schema.createHousingProject),
  deleteHousingProject: validate(schema.deleteHousingProject),
  deleteDraft: validate(schema.deleteDraft),
  upsertDraft: validate(schema.upsertDraft),
  getStatistics: validate(schema.getStatistics),
  getHousingProject: validate(schema.getHousingProject),
  patchHousingProject: validate(schema.patchHousingProject),
  searchHousingProjects: validate(schema.searchHousingProjects)
};
