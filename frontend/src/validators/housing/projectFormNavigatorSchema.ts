import { boolean, date, number, object, string, type InferType } from 'yup';
import { useI18n } from 'vue-i18n';

import { YES_NO_LIST, YES_NO_UNSURE_LIST } from '@/utils/constants/application';
import { CONTACT_PREFERENCE_LIST, PROJECT_RELATIONSHIP_LIST } from '@/utils/constants/projectCommon';
import { NUM_RESIDENTIAL_UNITS_LIST } from '@/utils/constants/housing';
import { APPLICATION_STATUS_LIST, QUEUE_PRIORITY, SUBMISSION_TYPE_LIST } from '@/utils/constants/projectCommon';
import { BasicResponse } from '@/utils/enums/application';
import { assignedToValidator, atsClientIdValidator, latitudeValidator, longitudeValidator } from '@/validators';

import { emailValidator } from '@/validators/common';

export function createProjectFormNavigatorSchema() {
  const { t } = useI18n();
  return object({
    aaiUpdated: boolean().required().label(t('i.housing.project.projectFormNavigatorSchema.aaiUpdated')),
    addedToAts: boolean().required().label(t('i.housing.project.projectFormNavigatorSchema.addedToAts')),
    ltsaCompleted: boolean().required().label(t('i.housing.project.projectFormNavigatorSchema.ltsaCompleted')),
    bcOnlineCompleted: boolean().required().label(t('i.housing.project.projectFormNavigatorSchema.bcOnlineCompleted')),
    astNotes: string().notRequired().max(4000).label(t('i.housing.project.projectFormNavigatorSchema.astNotes')),
    atsClientId: atsClientIdValidator,
    atsEnquiryId: string().notRequired(),
    contact: object({
      contactId: string(),
      email: emailValidator(t('i.housing.project.projectFormNavigatorSchema.validContact'))
        .required()
        .label(t('i.housing.project.projectFormNavigatorSchema.contactEmail')),
      firstName: string().required().max(255).label(t('i.housing.project.projectFormNavigatorSchema.contactFirstName')),
      lastName: string().max(255).label(t('i.housing.project.projectFormNavigatorSchema.contactLastName')).nullable(),
      phoneNumber: string().required().label(t('i.housing.project.projectFormNavigatorSchema.contactPhoneNumber')),
      contactApplicantRelationship: string()
        .required()
        .oneOf(PROJECT_RELATIONSHIP_LIST)
        .label(t('i.housing.project.projectFormNavigatorSchema.contactApplicantRelationship')),
      contactPreference: string()
        .required()
        .oneOf(CONTACT_PREFERENCE_LIST)
        .label(t('i.housing.project.projectFormNavigatorSchema.contactPreference')),
      userId: string()
    }),
    consentToFeedback: string()
      .notRequired()
      .nullable()
      .label(t('i.housing.project.projectFormNavigatorSchema.consentToFeedback')),
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
    }),
    location: object({
      streetAddress: string()
        .notRequired()
        .max(255)
        .label(t('i.housing.project.projectFormNavigatorSchema.locationStreetAddress')),
      locality: string()
        .notRequired()
        .max(255)
        .label(t('i.housing.project.projectFormNavigatorSchema.locationLocality')),
      province: string()
        .notRequired()
        .max(255)
        .label(t('i.housing.project.projectFormNavigatorSchema.locationProvince')),
      locationAddress: string(),
      locationPids: string()
        .notRequired()
        .max(255)
        .label(t('i.housing.project.projectFormNavigatorSchema.locationLocationPids')),
      latitude: latitudeValidator,
      longitude: longitudeValidator,
      geomarkUrl: string()
        .notRequired()
        .max(255)
        .label(t('i.housing.project.projectFormNavigatorSchema.locationGeomarkUrl')),
      naturalDisaster: string()
        .oneOf(YES_NO_LIST)
        .required()
        .label(t('i.housing.project.projectFormNavigatorSchema.locationNaturalDisaster'))
    }),
    locationPidsAuto: string(),
    projectLocationDescription: string()
      .notRequired()
      .max(4000)
      .label(t('i.housing.project.projectFormNavigatorSchema.projectLocationDescription')),
    project: object({
      companyIdRegistered: string().nullable(),
      companyNameRegistered: string()
        .notRequired()
        .max(255)
        .label(t('i.housing.project.projectFormSchema.projectCompanyNameRegistered')),
      projectName: string().required().max(255).label(t('i.housing.project.projectFormSchema.projectProjectName'))
    }),
    projectDescription: string()
      .notRequired()
      .label(t('i.housing.project.projectFormNavigatorSchema.projectDescription')),
    relatedEnquiries: string().notRequired().label(t('i.housing.project.projectFormNavigatorSchema.relatedEnquiries')),
    submittedAt: date(),
    submissionState: object({
      applicationStatus: string()
        .oneOf(APPLICATION_STATUS_LIST)
        .label(t('i.housing.project.projectFormNavigatorSchema.submissionStateApplicationStatus')),
      assignedUser: assignedToValidator,
      queuePriority: number()
        .required()
        .integer()
        .oneOf(QUEUE_PRIORITY)
        .typeError(t('i.housing.project.projectFormNavigatorSchema.priorityNumber'))
        .label(t('i.housing.project.projectFormNavigatorSchema.submissionStateQueuePriority')),
      submissionType: string()
        .required()
        .oneOf(SUBMISSION_TYPE_LIST)
        .label(t('i.housing.project.projectFormNavigatorSchema.submissionStateSubmissionType'))
    }),
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
      otherUnits: string().when('units.otherUnitsDescription', {
        is: (val: string) => val === BasicResponse.YES,
        then: (schema) =>
          schema
            .required()
            .oneOf(NUM_RESIDENTIAL_UNITS_LIST)
            .label(t('i.housing.project.projectFormNavigatorSchema.unitsOtherUnits')),
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
  });
}

export type FormSchemaType = InferType<ReturnType<typeof createProjectFormNavigatorSchema>>;
