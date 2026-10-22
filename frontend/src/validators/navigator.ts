import { z } from 'zod';

import { YES_NO_LIST, YES_NO_UNSURE_LIST } from '@/utils/constants/application';
import {
  APPLICATION_STATUS_LIST,
  AREA_LIST,
  CONTACT_PREFERENCE_LIST,
  PROJECT_RELATIONSHIP_LIST,
  QUEUE_PRIORITY,
  REGION_LIST,
  SUBMISSION_TYPE_LIST
} from '@/utils/constants/projectCommon';
import { BasicResponse, Initiative, Regex } from '@/utils/enums/application';
import { coerceNumber, isBlank, isOneOf } from '@/utils/utils';
import {
  evenWithIssues,
  formSection,
  maxMessage,
  oneOfMessage,
  blankOrOneOfSchema,
  optionalTextSchema,
  requiredMessage,
  requiredOneOf,
  requiredString,
  requiredTextSchema
} from '@/utils/zodSchema';
import {
  assignedToSchema,
  atsIdSchema,
  latitudeSchema,
  longitudeSchema,
  requireFinanceDescriptions,
  requireUnits,
  unitsSchema
} from '@/validators/common';

import type { CreateSchemaOptions } from '@/types';

export function createContactCardNavFormSchema({ t }: CreateSchemaOptions) {
  return {
    contact: formSection(
      z.looseObject({
        contactId: optionalTextSchema('Contact ID'),
        email: requiredString(t('validators.contactCardNavForm.contactEmail')).regex(
          new RegExp(Regex.EMAIL),
          t('validators.contactCardNavForm.validContact')
        ),
        firstName: requiredTextSchema(t('validators.contactCardNavForm.contactFirstName'), 255),
        lastName: optionalTextSchema(t('validators.contactCardNavForm.contactLastName'), 255),
        phoneNumber: optionalTextSchema(t('validators.contactCardNavForm.contactPhoneNumber')),
        contactApplicantRelationship: blankOrOneOfSchema(
          t('validators.contactCardNavForm.contactApplicantRelationship'),
          PROJECT_RELATIONSHIP_LIST
        ),
        contactPreference: blankOrOneOfSchema(
          t('validators.contactCardNavForm.contactPreference'),
          CONTACT_PREFERENCE_LIST
        ),
        userId: optionalTextSchema('User ID')
      })
    )
  };
}

export function createCompanyProjectNamePanelSchema({
  initiative,
  t,
  orgBookOptions
}: Required<Pick<CreateSchemaOptions, 'initiative' | 't' | 'orgBookOptions'>>) {
  const companyName =
    initiative === Initiative.ELECTRIFICATION
      ? requiredTextSchema('Company name', 255).refine(
          (value) => orgBookOptions.some((option) => option.registeredName === value),
          'Company name must be a valid value from the list of suggestions'
        )
      : optionalTextSchema(t('validators.companyProjectName.companyNameRegistered'));

  return {
    companyProjectName: formSection(
      z.looseObject({
        activityType:
          initiative === Initiative.GENERAL
            ? requiredOneOf(t('validators.companyProjectName.activityType'), ['Other'])
            : z.string().nullish(),
        companyIdRegistered: optionalTextSchema('Company ID'),
        companyNameRegistered: companyName,
        projectName: requiredTextSchema(t('validators.companyProjectName.projectName'), 255),
        projectNumber:
          initiative === Initiative.GENERAL
            ? optionalTextSchema(t('validators.companyProjectName.projectNumber'))
            : z.string().nullish()
      })
    )
  };
}

export function createElectrificationPanelSchema({
  codeList,
  t
}: Required<Pick<CreateSchemaOptions, 'codeList' | 't'>>) {
  return {
    electrification: formSection(
      z.looseObject({
        bcEnvironmentAssessNeeded: blankOrOneOfSchema('BC Environmental Assessment needed?', YES_NO_LIST),
        bcHydroNumber: optionalTextSchema('BC Hydro Call for Power project number', 255),
        hasEpa: blankOrOneOfSchema('Do they have an EPA?', YES_NO_LIST),
        megawatts: z.preprocess(
          (value) => (value === '' ? null : coerceNumber(value)),
          z.number(t('i.common.form.numberError')).positive('Must be greater than zero').nullish()
        ),
        projectType: requiredOneOf('Project type', codeList.ElectrificationProjectType),
        projectCategory: blankOrOneOfSchema('Project category', codeList.ElectrificationProjectCategory)
      })
    )
  };
}

export function createLocationPanelSchema({ t }: CreateSchemaOptions) {
  return {
    location: formSection(
      z.looseObject({
        geomarkUrl: optionalTextSchema(t('validators.location.geomarkUrl'), 255),
        locality: optionalTextSchema(t('validators.location.locality'), 255),
        locationAddress: optionalTextSchema('Location address'),
        locationPids: optionalTextSchema(t('validators.location.locationPids'), 255),
        latitude: latitudeSchema(t('validators.location.latitude')),
        longitude: longitudeSchema(t('validators.location.longitude')),
        naturalDisaster: requiredOneOf(t('validators.location.naturalDisaster'), YES_NO_LIST),
        province: optionalTextSchema(t('validators.location.province'), 255),
        streetAddress: optionalTextSchema(t('validators.location.streetAddress'), 255)
      })
    )
  };
}

export function createLocationPidsPanelSchema() {
  return {
    locationPids: formSection(z.looseObject({ auto: optionalTextSchema('Location PIDs') }))
  };
}

export function createLocationDescriptionPanelSchema({ t }: CreateSchemaOptions) {
  return {
    locationDescription: formSection(
      z.looseObject({ description: optionalTextSchema(t('validators.locationDescription.description'), 4000) })
    )
  };
}

export function createProjectDescriptionPanelSchema({ t }: CreateSchemaOptions) {
  return {
    projectDescription: formSection(
      z.looseObject({ description: requiredTextSchema(t('validators.projectDescription.description')) })
    )
  };
}

export function createAstNotesPanelSchema({ t }: CreateSchemaOptions) {
  return {
    astNotes: formSection(z.looseObject({ notes: optionalTextSchema(t('validators.astNotes.notes'), 4000) }))
  };
}

export function createSubmissionStatePanelSchema({ initiative, t }: CreateSchemaOptions) {
  const isGeneral = initiative === Initiative.GENERAL;
  const queuePriorityLabel = t('validators.submissionState.queuePriority');

  return {
    submissionState: formSection(
      z.looseObject({
        applicationStatus: requiredOneOf(t('validators.submissionState.applicationStatus'), APPLICATION_STATUS_LIST),
        area: isGeneral ? z.enum(AREA_LIST, 'Area is a required field') : z.string().nullish(),
        assignedUser: assignedToSchema(t('validators.submissionState.assignedToMsg')),
        queuePriority: z.preprocess(
          coerceNumber,
          z
            .number({
              error: (issue) =>
                isBlank(issue.input)
                  ? requiredMessage(queuePriorityLabel)
                  : t('validators.submissionState.queuePriorityNumber')
            })
            .int(`${queuePriorityLabel} must be an integer`)
            .refine((value) => isOneOf(QUEUE_PRIORITY, value), oneOfMessage(queuePriorityLabel, QUEUE_PRIORITY))
        ),
        region: isGeneral ? z.enum(REGION_LIST, 'Region is a required field') : z.string().nullish(),
        submissionType: requiredOneOf(t('validators.submissionState.submissionType'), SUBMISSION_TYPE_LIST)
      })
    )
  };
}

export function createRelatedEnquiriesPanelSchema() {
  return {
    relatedEnquiries: formSection(z.looseObject({ csv: z.string().nullish() }))
  };
}

export function createAtsInfoPanelSchema({
  initiative,
  t,
  codeList
}: Required<Pick<CreateSchemaOptions, 'initiative' | 't' | 'codeList'>>) {
  const businessAreaLabel = t('validators.atsInfo.businessArea');

  return {
    atsInfo: formSection(
      z.looseObject({
        atsClientId: atsIdSchema(t('validators.atsClientId.label')),
        atsEnquiryId: atsIdSchema('ATS enquiry #'),
        businessArea:
          initiative === Initiative.GENERAL
            ? z
                .enum(
                  codeList.BusinessArea as [string, ...string[]],
                  oneOfMessage(businessAreaLabel, codeList.BusinessArea)
                )
                .nullish()
            : z.string().nullish()
      })
    )
  };
}

export function createProjectAreasUpdatedSchema({ initiative, t }: CreateSchemaOptions) {
  const requiredFlag = (label: string, required: boolean) =>
    required ? z.boolean(requiredMessage(label)) : z.boolean().optional();

  return {
    projectAreasUpdated: formSection(
      z.looseObject({
        aaiUpdated: z.boolean(requiredMessage(t('validators.projectAreasUpdated.aaiUpdated'))),
        addedToAts: requiredFlag(t('validators.projectAreasUpdated.addedToAts'), initiative !== Initiative.GENERAL),
        ltsaCompleted: requiredFlag(
          t('validators.projectAreasUpdated.ltsaCompleted'),
          initiative === Initiative.HOUSING
        ),
        bcOnlineCompleted: requiredFlag(
          t('validators.projectAreasUpdated.bcOnlineCompleted'),
          initiative === Initiative.HOUSING
        )
      })
    )
  };
}

export function createResidentialUnitsSchema({ t }: CreateSchemaOptions) {
  const label = (key: string) => t(`i.housing.project.projectFormNavigatorSchema.${key}`);

  return {
    units: formSection(
      z
        .looseObject({
          singleFamilyUnits: unitsSchema(label('unitsSingleFamilyUnits')),
          multiFamilyUnits: unitsSchema(label('unitsMultiFamilyUnits')),
          otherUnitsDescription: z
            .string()
            .max(255, maxMessage(label('unitsOtherUnitsDescription'), 255))
            .nullish(),
          otherUnits: z.string().nullish(),
          hasRentalUnits: requiredOneOf(label('unitsHasRentalUnits'), YES_NO_UNSURE_LIST),
          rentalUnits: z.string().nullish()
        })
        .superRefine((value, ctx) => {
          // Matches ResidentialUnitsPanel, which enables otherUnits once any description is entered
          if (value.otherUnitsDescription) requireUnits(ctx, 'otherUnits', label('unitsOtherUnits'), value.otherUnits);
          if (value.hasRentalUnits === BasicResponse.YES) {
            requireUnits(ctx, 'rentalUnits', label('unitsRentalUnits'), value.rentalUnits);
          }
        }, evenWithIssues)
    )
  };
}

export function createFinanciallySupportedPanelSchema({ t }: CreateSchemaOptions) {
  const label = (key: string) => t(`i.housing.project.projectFormNavigatorSchema.${key}`);
  const supported = (key: string) => requiredOneOf(label(key), YES_NO_UNSURE_LIST);

  return {
    finance: formSection(
      z
        .looseObject({
          financiallySupportedBc: supported('financeFinanciallySupportedBc'),
          financiallySupportedIndigenous: supported('financeFinanciallySupportedIndigenous'),
          indigenousDescription: z.string().nullish(),
          financiallySupportedNonProfit: supported('financeFinanciallySupportedNonProfit'),
          nonProfitDescription: z.string().nullish(),
          financiallySupportedHousingCoop: supported('financeFinanciallySupportedHousingCoop'),
          housingCoopDescription: z.string().nullish()
        })
        .superRefine(
          (value, ctx) =>
            requireFinanceDescriptions(ctx, value, {
              indigenous: label('financeIndigenousDescription'),
              nonProfit: label('financeNonProfitDescription'),
              housingCoop: label('financeHousingCoopDescription')
            }),
          evenWithIssues
        )
    )
  };
}

export function createConsentPanelSchema({ t }: CreateSchemaOptions) {
  return {
    consent: formSection(
      z.looseObject({ consentToFeedback: requiredOneOf(t('validators.consent.consentToFeedback'), YES_NO_LIST) })
    )
  };
}
