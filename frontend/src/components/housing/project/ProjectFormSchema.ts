import { boolean, number, object, string } from 'yup';
import { useI18n } from 'vue-i18n';

import { YES_NO_LIST, YES_NO_UNSURE_LIST } from '@/utils/constants/application';
import { CONTACT_PREFERENCE_LIST, PROJECT_RELATIONSHIP_LIST } from '@/utils/constants/projectCommon';
import { NUM_RESIDENTIAL_UNITS_LIST } from '@/utils/constants/housing';
import {
  APPLICATION_STATUS_LIST,
  INTAKE_STATUS_LIST,
  QUEUE_PRIORITY,
  SUBMISSION_TYPE_LIST
} from '@/utils/constants/projectCommon';
import { BasicResponse } from '@/utils/enums/application';
import { atsClientIdValidator, latitudeValidator, longitudeValidator } from '@/validators';

import { emailValidator } from '@/validators/common';

export function createProjectFormSchema() {
  const { t } = useI18n();
  return object({
    aaiUpdated: boolean().required().label(t('i.housing.project.projectFormSchema.aaiUpdated')),
    addedToAts: boolean().required().label(t('i.housing.project.projectFormSchema.addedToAts')),
    ltsaCompleted: boolean().required().label(t('i.housing.project.projectFormSchema.ltsaCompleted')),
    bcOnlineCompleted: boolean().required().label(t('i.housing.project.projectFormSchema.bcOnlineCompleted')),
    astNotes: string().notRequired().max(4000).label(t('i.housing.project.projectFormSchema.astNotes')),
    atsClientId: atsClientIdValidator,
    contact: object({
      email: emailValidator(t('i.housing.project.projectFormSchema.validContact'))
        .required()
        .label(t('i.housing.project.projectFormSchema.contactEmail')),
      firstName: string().required().max(255).label(t('i.housing.project.projectFormSchema.contactFirstName')),
      lastName: string().max(255).label(t('i.housing.project.projectFormSchema.contactLastName')).nullable(),
      phoneNumber: string().required().label(t('i.housing.project.projectFormSchema.contactPhoneNumber')),
      contactApplicantRelationship: string()
        .required()
        .oneOf(PROJECT_RELATIONSHIP_LIST)
        .label(t('i.housing.project.projectFormSchema.contactApplicantRelationship')),
      contactPreference: string()
        .required()
        .oneOf(CONTACT_PREFERENCE_LIST)
        .label(t('i.housing.project.projectFormSchema.contactPreference'))
    }),
    consentToFeedback: string()
      .notRequired()
      .nullable()
      .label(t('i.housing.project.projectFormSchema.consentToFeedback')),
    finance: object({
      financiallySupportedBc: string()
        .required()
        .oneOf(YES_NO_UNSURE_LIST)
        .label(t('i.housing.project.projectFormSchema.financeFinanciallySupportedBc')),
      financiallySupportedIndigenous: string()
        .required()
        .oneOf(YES_NO_UNSURE_LIST)
        .label(t('i.housing.project.projectFormSchema.financeFinanciallySupportedIndigenous')),
      indigenousDescription: string().when('finance.financiallySupportedIndigenous', {
        is: (val: string) => val === BasicResponse.YES,
        then: (schema) =>
          schema.required().max(255).label(t('i.housing.project.projectFormSchema.financeIndigenousDescription')),
        otherwise: () => string().notRequired()
      }),
      financiallySupportedNonProfit: string()
        .required()
        .oneOf(YES_NO_UNSURE_LIST)
        .label(t('i.housing.project.projectFormSchema.financeFinanciallySupportedNonProfit')),
      nonProfitDescription: string().when('finance.financiallySupportedNonProfit', {
        is: (val: string) => val === BasicResponse.YES,
        then: (schema) =>
          schema.required().max(255).label(t('i.housing.project.projectFormSchema.financeNonProfitDescription')),
        otherwise: () => string().notRequired()
      }),
      financiallySupportedHousingCoop: string()
        .required()
        .oneOf(YES_NO_UNSURE_LIST)
        .label(t('i.housing.project.projectFormSchema.financeFinanciallySupportedHousingCoop')),
      housingCoopDescription: string().when('finance.financiallySupportedHousingCoop', {
        is: (val: string) => val === BasicResponse.YES,
        then: (schema) =>
          schema.required().max(255).label(t('i.housing.project.projectFormSchema.financeHousingCoopDescription')),
        otherwise: () => string().notRequired()
      })
    }),
    location: object({
      streetAddress: string()
        .notRequired()
        .max(255)
        .label(t('i.housing.project.projectFormSchema.locationStreetAddress')),
      locality: string().notRequired().max(255).label(t('i.housing.project.projectFormSchema.locationLocality')),
      province: string().notRequired().max(255).label(t('i.housing.project.projectFormSchema.locationProvince')),
      locationPids: string()
        .notRequired()
        .max(255)
        .label(t('i.housing.project.projectFormSchema.locationLocationPids')),
      latitude: latitudeValidator,
      longitude: longitudeValidator,
      geomarkUrl: string().notRequired().max(255).label(t('i.housing.project.projectFormSchema.locationGeomarkUrl')),
      naturalDisaster: string()
        .oneOf(YES_NO_LIST)
        .required()
        .label(t('i.housing.project.projectFormSchema.locationNaturalDisaster'))
    }),
    projectLocationDescription: string()
      .notRequired()
      .max(4000)
      .label(t('i.housing.project.projectFormSchema.projectLocationDescription')),
    project: object({
      companyNameRegistered: string()
        .notRequired()
        .max(255)
        .label(t('i.housing.project.projectFormSchema.projectCompanyNameRegistered')),
      isDevelopedInBc: string().when('project.companyNameRegistered', {
        is: (val: string) => val,
        then: (schema) =>
          schema.required().oneOf(YES_NO_LIST).label(t('i.housing.project.projectFormSchema.projectIsDevelopedInBc')),
        otherwise: () => string().notRequired()
      }),
      projectName: string().required().max(255).label(t('i.housing.project.projectFormSchema.projectProjectName'))
    }),
    projectDescription: string().notRequired().label(t('i.housing.project.projectFormSchema.projectDescription')),
    relatedEnquiries: string().notRequired().label(t('i.housing.project.projectFormSchema.relatedEnquiries')),
    submissionState: object({
      applicationStatus: string()
        .oneOf(APPLICATION_STATUS_LIST)
        .label(t('i.housing.project.projectFormSchema.submissionStateApplicationStatus')),
      intakeStatus: string()
        .oneOf(INTAKE_STATUS_LIST)
        .label(t('i.housing.project.projectFormSchema.submissionStateIntakeStatus')),
      queuePriority: number()
        .required()
        .integer()
        .oneOf(QUEUE_PRIORITY)
        .typeError(t('i.housing.project.projectFormSchema.priorityNumber'))
        .label(t('i.housing.project.projectFormSchema.submissionStateQueuePriority')),
      submissionType: string()
        .required()
        .oneOf(SUBMISSION_TYPE_LIST)
        .label(t('i.housing.project.projectFormSchema.submissionStateSubmissionType'))
    }),
    units: object({
      singleFamilyUnits: string()
        .notRequired()
        .oneOf(NUM_RESIDENTIAL_UNITS_LIST)
        .label(t('i.housing.project.projectFormSchema.unitsSingleFamilyUnits')),
      multiFamilyUnits: string()
        .notRequired()
        .oneOf(NUM_RESIDENTIAL_UNITS_LIST)
        .label(t('i.housing.project.projectFormSchema.unitsMultiFamilyUnits')),
      otherUnitsDescription: string()
        .notRequired()
        .max(255)
        .label(t('i.housing.project.projectFormSchema.unitsOtherUnitsDescription')),
      otherUnits: string().when('units.otherUnitsDescription', {
        is: (val: string) => val === BasicResponse.YES,
        then: (schema) =>
          schema
            .required()
            .oneOf(NUM_RESIDENTIAL_UNITS_LIST)
            .label(t('i.housing.project.projectFormSchema.unitsOtherUnits')),
        otherwise: () => string().notRequired()
      }),
      hasRentalUnits: string()
        .required()
        .oneOf(YES_NO_UNSURE_LIST)
        .label(t('i.housing.project.projectFormSchema.unitsHasRentalUnits')),
      rentalUnits: string().when('units.hasRentalUnits', {
        is: (val: string) => val === BasicResponse.YES,
        then: (schema) =>
          schema
            .required()
            .oneOf(NUM_RESIDENTIAL_UNITS_LIST)
            .label(t('i.housing.project.projectFormSchema.unitsRentalUnits')),
        otherwise: () => string().notRequired()
      })
    })
  });
}
