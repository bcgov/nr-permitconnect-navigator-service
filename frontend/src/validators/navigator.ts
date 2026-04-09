import '@/utils/yupMethods';
import { boolean, number, object, string } from 'yup';

import { YES_NO_LIST, YES_NO_UNSURE_LIST } from '@/utils/constants/application';
import {
  AREA_LIST,
  BUSINESS_AREA_LIST,
  CONTACT_PREFERENCE_LIST,
  PROJECT_RELATIONSHIP_LIST,
  REGION_LIST
} from '@/utils/constants/projectCommon';
import { APPLICATION_STATUS_LIST, QUEUE_PRIORITY, SUBMISSION_TYPE_LIST } from '@/utils/constants/projectCommon';
import {
  assignedToValidator,
  atsClientIdValidator,
  latitudeValidator,
  longitudeValidator,
  optionalText,
  requiredText
} from '@/validators/common';
import { emailValidator } from '@/validators/common';
import { BasicResponse, Initiative } from '@/utils/enums/application';
import { NUM_RESIDENTIAL_UNITS_LIST } from '@/utils/constants/housing';

import type { CodeName } from '@/store/codeStore';
import type { OrgBookOption } from '@/types';

interface CreateSchemaOptions {
  initiative?: Initiative;
  t: (key: string) => string; // i18n instance
  codeList?: Record<CodeName, string[]>;
  enums?: Record<CodeName, Record<string, string>>;
  orgBookOptions?: OrgBookOption[];
}

export function createContactCardNavFormSchema({ t }: CreateSchemaOptions) {
  return {
    contact: object({
      contactId: optionalText(),
      email: emailValidator(t('validators.contactCardNavForm.validContact'))
        .required()
        .label(t('validators.contactCardNavForm.contactEmail')),
      firstName: requiredText(255).label(t('validators.contactCardNavForm.contactFirstName')),
      lastName: optionalText(255).label(t('validators.contactCardNavForm.contactLastName')).nullable(),
      phoneNumber: requiredText().label(t('validators.contactCardNavForm.contactPhoneNumber')),
      contactApplicantRelationship: requiredText()
        .oneOf(PROJECT_RELATIONSHIP_LIST)
        .label(t('validators.contactCardNavForm.contactApplicantRelationship')),
      contactPreference: requiredText()
        .oneOf(CONTACT_PREFERENCE_LIST)
        .label(t('validators.contactCardNavForm.contactPreference')),
      userId: optionalText()
    })
  };
}

export function createCompanyProjectNamePanelSchema({
  initiative,
  t,
  orgBookOptions
}: Required<Pick<CreateSchemaOptions, 'initiative' | 't' | 'orgBookOptions'>>) {
  return {
    companyProjectName: object({
      activityType: string().when([], {
        is: () => initiative === Initiative.GENERAL,
        then: (schema) => schema.oneOf(['Other']).required().label(t('validators.companyProjectName.activityType')),
        otherwise: (schema) => schema.notRequired()
      }),
      companyIdRegistered: optionalText(),
      companyNameRegistered: optionalText().when([], {
        is: () => initiative === Initiative.ELECTRIFICATION,
        then: (schema) =>
          schema
            .required()
            .max(255)
            .test('valid-company-name', 'Company name must be a valid value from the list of suggestions', (value) => {
              if (!value) return false;
              return orgBookOptions.some((option) => option.registeredName === value);
            })
            .label('Company name'),
        otherwise: (schema) =>
          schema.trim().emptyToNull().nullable().label(t('validators.companyProjectName.companyNameRegistered'))
      }),
      projectName: requiredText(255).label(t('validators.companyProjectName.projectName')),
      projectNumber: string().when([], {
        is: () => initiative === Initiative.GENERAL,
        then: (schema) =>
          schema.trim().emptyToNull().nullable().label(t('validators.companyProjectName.projectNumber')),
        otherwise: (schema) => schema.notRequired()
      })
    })
  };
}

export function createElectrificationPanelSchema({ codeList }: Required<Pick<CreateSchemaOptions, 'codeList'>>) {
  return {
    electrification: object({
      bcEnvironmentAssessNeeded: optionalText().oneOf(YES_NO_LIST).label('BC Environmental Assessment needed?'),
      bcHydroNumber: optionalText().max(255).label('BC Hydro Call for Power project number'),
      hasEpa: optionalText().oneOf(YES_NO_LIST).label('Do they have an EPA?'),
      megawatts: number()
        .notRequired()
        .positive('Must be greater than zero')
        .label('How many megawatts will it produce?'),
      projectType: string().required().max(255).oneOf(codeList.ElectrificationProjectType).label('Project type'),
      projectCategory: optionalText().oneOf(codeList.ElectrificationProjectCategory).label('Project category')
    })
  };
}

export function createLocationPanelSchema({ t }: CreateSchemaOptions) {
  return {
    location: object({
      geomarkUrl: optionalText(255).label(t('validators.location.geomarkUrl')),
      locality: optionalText(255).label(t('validators.location.locality')),
      locationAddress: optionalText(),
      locationPids: optionalText(255).label(t('validators.location.locationPids')),
      latitude: latitudeValidator(t('validators.location.latitude')),
      longitude: longitudeValidator(t('validators.location.longitude')),
      naturalDisaster: requiredText().oneOf(YES_NO_LIST).label(t('validators.location.naturalDisaster')),
      province: optionalText(255).label(t('validators.location.province')),
      streetAddress: optionalText(255).label(t('validators.location.streetAddress'))
    })
  };
}

export function createLocationPidsPanelSchema() {
  return {
    locationPids: object({
      auto: optionalText()
    })
  };
}

export function createLocationDescriptionPanelSchema({ t }: CreateSchemaOptions) {
  return {
    locationDescription: object({
      description: optionalText(4000).label(t('validators.locationDescription.description'))
    })
  };
}

export function createProjectDescriptionPanelSchema({
  initiative,
  t,
  enums
}: Required<Pick<CreateSchemaOptions, 'initiative' | 't' | 'enums'>>) {
  const isElectrification = initiative === Initiative.ELECTRIFICATION;

  const descriptionSchema = isElectrification
    ? string().when('project.projectType', {
        is: enums.ElectrificationProjectType.OTHER,
        then: (schema) => schema.required().label('Additional information about your project'),
        otherwise: (schema) => schema.notRequired().nullable().label('Additional information about your project')
      })
    : requiredText().label(t('validators.projectDescription.description'));

  return {
    projectDescription: object({
      description: descriptionSchema
    })
  };
}

export function createResidentialUnitsSchema({ t }: CreateSchemaOptions) {
  return {
    units: object({
      singleFamilyUnits: string()
        .notRequired()
        .oneOf(NUM_RESIDENTIAL_UNITS_LIST)
        .label(t('i.housing.project.projectFormNavigatorSchema.unitsSingleFamilyUnits')),
      multiFamilyUnits: string()
        .notRequired()
        .oneOf(NUM_RESIDENTIAL_UNITS_LIST)
        .label(t('i.housing.project.projectFormNavigatorSchema.unitsMultiFamilyUnits')),
      otherUnitsDescription: string()
        .notRequired()
        .max(255)
        .label(t('i.housing.project.projectFormNavigatorSchema.unitsOtherUnitsDescription')),
      otherUnits: string()
        .oneOf(NUM_RESIDENTIAL_UNITS_LIST)
        .notRequired()
        .when('units.otherUnitsDescription', {
          is: (val: string) => val === BasicResponse.YES,
          then: (schema) => schema.required().label(t('i.housing.project.projectFormNavigatorSchema.unitsOtherUnits')),
          otherwise: () => string().notRequired()
        }),
      hasRentalUnits: string()
        .required()
        .oneOf(YES_NO_UNSURE_LIST)
        .label(t('i.housing.project.projectFormNavigatorSchema.unitsHasRentalUnits')),
      rentalUnits: string().when('units.hasRentalUnits', {
        is: (val: string) => val === BasicResponse.YES,
        then: (schema) =>
          schema
            .required()
            .oneOf(NUM_RESIDENTIAL_UNITS_LIST)
            .label(t('i.housing.project.projectFormNavigatorSchema.unitsRentalUnits')),
        otherwise: () => string().notRequired()
      })
    })
  };
}

export function createFinanciallySupportedPanelSchema({ t }: CreateSchemaOptions) {
  return {
    finance: object({
      financiallySupportedBc: string()
        .required()
        .oneOf(YES_NO_UNSURE_LIST)
        .label(t('i.housing.project.projectFormNavigatorSchema.financeFinanciallySupportedBc')),
      financiallySupportedIndigenous: string()
        .required()
        .oneOf(YES_NO_UNSURE_LIST)
        .label(t('i.housing.project.projectFormNavigatorSchema.financeFinanciallySupportedIndigenous')),
      indigenousDescription: string().when('finance.financiallySupportedIndigenous', {
        is: (val: string) => val === BasicResponse.YES,
        then: (schema) =>
          schema
            .required()
            .max(255)
            .label(t('i.housing.project.projectFormNavigatorSchema.financeIndigenousDescription')),
        otherwise: () => string().notRequired()
      }),
      financiallySupportedNonProfit: string()
        .required()
        .oneOf(YES_NO_UNSURE_LIST)
        .label(t('i.housing.project.projectFormNavigatorSchema.financeFinanciallySupportedNonProfit')),
      nonProfitDescription: string().when('finance.financiallySupportedNonProfit', {
        is: (val: string) => val === BasicResponse.YES,
        then: (schema) =>
          schema
            .required()
            .max(255)
            .label(t('i.housing.project.projectFormNavigatorSchema.financeNonProfitDescription')),
        otherwise: () => string().notRequired()
      }),
      financiallySupportedHousingCoop: string()
        .required()
        .oneOf(YES_NO_UNSURE_LIST)
        .label(t('i.housing.project.projectFormNavigatorSchema.financeFinanciallySupportedHousingCoop')),
      housingCoopDescription: string().when('finance.financiallySupportedHousingCoop', {
        is: (val: string) => val === BasicResponse.YES,
        then: (schema) =>
          schema
            .required()
            .max(255)
            .label(t('i.housing.project.projectFormNavigatorSchema.financeHousingCoopDescription')),
        otherwise: () => string().notRequired()
      })
    })
  };
}

export function createAstNotesPanelSchema({ t }: CreateSchemaOptions) {
  return {
    astNotes: object({
      notes: optionalText(4000).label(t('validators.astNotes.notes'))
    })
  };
}

export function createSubmissionStatePanelSchema({ initiative, t }: CreateSchemaOptions) {
  return {
    submissionState: object({
      applicationStatus: string()
        .required()
        .oneOf(APPLICATION_STATUS_LIST)
        .label(t('validators.submissionState.applicationStatus')),
      area: string().when([], {
        is: () => initiative === Initiative.GENERAL,
        then: (schema) =>
          schema.oneOf(AREA_LIST, 'Area is a required field').label(t('validators.submissionState.area')),
        otherwise: (schema) => schema.notRequired()
      }),
      assignedUser: assignedToValidator(
        t('validators.submissionState.assignedToMsg'),
        t('validators.submissionState.assignedTo')
      ),
      queuePriority: number()
        .required()
        .integer()
        .oneOf(QUEUE_PRIORITY)
        .typeError(t('validators.submissionState.queuePriorityNumber'))
        .label(t('validators.submissionState.queuePriority')),
      region: string().when([], {
        is: () => initiative === Initiative.GENERAL,
        then: (schema) =>
          schema.oneOf(REGION_LIST, 'Region is a required field').label(t('validators.submissionState.region')),
        otherwise: (schema) => schema.notRequired()
      }),
      submissionType: string()
        .required()
        .oneOf(SUBMISSION_TYPE_LIST)
        .label(t('validators.submissionState.submissionType'))
    })
  };
}

export function createRelatedEnquiriesPanelSchema({ t }: CreateSchemaOptions) {
  return {
    relatedEnquiries: object({
      csv: string().notRequired().label(t('validators.relatedEnquiries.csv'))
    })
  };
}

export function createAtsInfoPanelSchema({ initiative, t }: CreateSchemaOptions) {
  return {
    atsInfo: object({
      atsClientId: atsClientIdValidator(t('validators.atsClientId.label')),
      atsEnquiryId: number().nullable(),
      businessArea: string()
        .nullable()
        .when([], {
          is: () => initiative === Initiative.GENERAL,
          then: (schema) => schema.oneOf(BUSINESS_AREA_LIST).label(t('validators.atsInfo.businessArea')),
          otherwise: (schema) => schema.notRequired()
        })
    })
  };
}

export function createProjectAreasUpdatedSchema({ initiative, t }: CreateSchemaOptions) {
  return {
    projectAreasUpdated: object({
      aaiUpdated: boolean().required().label(t('validators.projectAreasUpdated.aaiUpdated')),
      addedToAts: boolean().when([], {
        is: () => initiative !== Initiative.GENERAL,
        then: (schema) => schema.required().label(t('validators.projectAreasUpdated.aaiUpdated')),
        otherwise: (schema) => schema.notRequired()
      }),
      ltsaCompleted: boolean().when([], {
        is: () => initiative === Initiative.HOUSING,
        then: (schema) => schema.required().label(t('validators.projectAreasUpdated.aaiUpdated')),
        otherwise: (schema) => schema.notRequired()
      }),
      bcOnlineCompleted: boolean().when([], {
        is: () => initiative === Initiative.HOUSING,
        then: (schema) => schema.required().label(t('validators.projectAreasUpdated.bcOnlineCompleted')),
        otherwise: (schema) => schema.notRequired()
      })
    })
  };
}

export function createConsentPanelSchema({ t }: CreateSchemaOptions) {
  return {
    consent: object({
      consentToFeedback: string().required().oneOf(YES_NO_LIST).label(t('validators.consent.consentToFeedback'))
    })
  };
}
