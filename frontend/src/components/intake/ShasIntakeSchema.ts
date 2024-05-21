import { array, boolean, mixed, number, object, string } from 'yup';

import {
  ContactPreferenceList,
  NumResidentialUnits,
  ProjectRelationshipList,
  Regex,
  YesNo,
  YesNoUnsure
} from '@/utils/constants';
import { BASIC_RESPONSES, INTAKE_FORM_CATEGORIES, PROJECT_LOCATION } from '@/utils/enums';

// Form validation schema
const YesNoUnsureSchema = string().required().oneOf(YesNoUnsure);
const stringRequiredSchema = string().required().max(255);

export const intakeSchema = object({
  [INTAKE_FORM_CATEGORIES.APPLICANT]: object({
    firstName: stringRequiredSchema.label('First name'),
    lastName: stringRequiredSchema.label('Last name'),
    phoneNumber: stringRequiredSchema.label('Phone number'),
    email: string().matches(new RegExp(Regex.EMAIL), 'Email must be valid').required().label('Email'),
    relationshipToProject: string().required().oneOf(ProjectRelationshipList).label('Relationship to project'),
    contactPreference: string().required().oneOf(ContactPreferenceList).label('Contact Preference')
  }),
  [INTAKE_FORM_CATEGORIES.BASIC]: object({
    isDevelopedByCompanyOrOrg: string().required().oneOf(YesNo).label('Project developed'),
    isDevelopedInBC: string().when('isDevelopedByCompanyOrOrg', {
      is: (previousQuestion: string) => previousQuestion === BASIC_RESPONSES.YES,
      then: (schema) => schema.required().oneOf(YesNo).label('Registered in BC')
    }),
    registeredName: string().when('isDevelopedInBC', {
      is: (previousQuestion: string) => previousQuestion,
      then: (schema) => schema.required().max(255).label('Business name')
    })
  }),
  [INTAKE_FORM_CATEGORIES.HOUSING]: object().shape(
    {
      projectName: stringRequiredSchema.label('Project name'),
      projectDescription: string().required().label('Project description'),
      hasRentalUnits: YesNoUnsureSchema.label('Rental units'),
      financiallySupportedBC: YesNoUnsureSchema.label('BC Housing'),
      financiallySupportedIndigenous: YesNoUnsureSchema.label('Indigenous Housing Provider'),
      financiallySupportedNonProfit: YesNoUnsureSchema.label('Non-profit housing society'),
      financiallySupportedHousingCoop: YesNoUnsureSchema.label('Housing co-operative'),
      rentalUnits: string().when('hasRentalUnits', {
        is: (value: string) => value === BASIC_RESPONSES.YES,
        then: () => string().oneOf(NumResidentialUnits).required().label('Expected rental units'),
        otherwise: () => string().nullable()
      }),
      indigenousDescription: string().when('financiallySupportedIndigenous', {
        is: (value: string) => value === BASIC_RESPONSES.YES,
        then: () => stringRequiredSchema.label('Indigenous housing provider'),
        otherwise: () => string().nullable()
      }),
      nonProfitDescription: string().when('financiallySupportedNonProfit', {
        is: (value: string) => value === BASIC_RESPONSES.YES,
        then: () => stringRequiredSchema.label('Non-profit housing society'),
        otherwise: () => string().nullable()
      }),
      housingCoopDescription: string().when('financiallySupportedHousingCoop', {
        is: (value: string) => value === BASIC_RESPONSES.YES,
        then: () => stringRequiredSchema.label('Housing co-operative'),
        otherwise: () => string().nullable()
      }),
      singleFamilySelected: boolean().when(['multiFamilySelected', 'otherSelected'], {
        is: (multi: boolean, other: boolean) => !(multi || other),
        then: (schema) => {
          return schema.test('housing-checkbox-test', '\n', function (value) {
            if (value) return true;
            else return false;
          });
        },
        otherwise: (schema) => schema.notRequired()
      }),
      singleFamilyUnits: string().when('singleFamilySelected', {
        is: (prev: boolean) => prev,
        then: (schema) => schema.required().oneOf(NumResidentialUnits).label('Expected number of single-family units'),
        otherwise: () => string().nullable()
      }),
      multiFamilySelected: boolean().when(['singleFamilySelected', 'otherSelected'], {
        is: (single: boolean, other: boolean) => !(single || other),
        then: (schema) => {
          return schema.test('housing-checkbox-test', '\n', function (value) {
            if (value) return true;
            else return false;
          });
        },
        otherwise: (schema) => schema.notRequired()
      }),
      multiFamilyUnits: string().when('multiFamilySelected', {
        is: (prev: boolean) => prev,
        then: (schema) => schema.required().oneOf(NumResidentialUnits).label('Expected number of multi-family units'),
        otherwise: () => string().nullable()
      }),
      otherSelected: boolean().when(['singleFamilySelected', 'multiFamilySelected'], {
        is: (single: boolean, multi: boolean) => !(single || multi),
        then: (schema) => {
          return schema.test('housing-checkbox-test', '\n', function (value) {
            if (value) return true;
            else return false;
          });
        },
        otherwise: (schema) => schema.notRequired()
      }),
      otherUnitsDescription: string().when('otherSelected', {
        is: (prev: boolean) => prev,
        then: (schema) => schema.required().label('Description of units'),
        otherwise: () => string().nullable()
      }),
      otherUnits: string().when('otherSelected', {
        is: (prev: boolean) => prev,
        then: (schema) => schema.required().oneOf(NumResidentialUnits).label('Expected number of other units'),
        otherwise: () => string().nullable()
      })
    },
    [
      ['multiFamilySelected', 'otherSelected'],
      ['singleFamilySelected', 'otherSelected'],
      ['singleFamilySelected', 'multiFamilySelected']
    ]
  ),
  [INTAKE_FORM_CATEGORIES.LOCATION]: object({
    naturalDisaster: string().oneOf(YesNo).required().label('Natural disaster'),
    projectLocation: string().required().label('Location'),
    streetAddress: string().when('projectLocation', {
      is: (value: string) => value === PROJECT_LOCATION.STREET_ADDRESS,
      then: () => stringRequiredSchema.label('Street address'),
      otherwise: () => string().nullable()
    }),
    locality: string().when('projectLocation', {
      is: (value: string) => value === PROJECT_LOCATION.STREET_ADDRESS,
      then: () => stringRequiredSchema.label('Locality'),
      otherwise: () => string().nullable()
    }),
    province: string().when('projectLocation', {
      is: (value: string) => value === PROJECT_LOCATION.STREET_ADDRESS,
      then: () => stringRequiredSchema.label('Province'),
      otherwise: () => string().nullable()
    }),
    latitude: number().when('projectLocation', {
      is: (value: string) => value === PROJECT_LOCATION.LOCATION_COORDINATES,
      then: () => number().required().min(48).max(60).label('Latitude'),
      otherwise: () => number().nullable().min(48).max(60).label('Latitude')
    }),
    longitude: number().when('projectLocation', {
      is: (value: string) => value === PROJECT_LOCATION.LOCATION_COORDINATES,
      then: () => number().required().min(-139).max(-114).label('Longitude'),
      otherwise: () => number().nullable().min(-139).max(-114).label('Longitude')
    }),
    ltsaPIDLookup: string().max(255).label('Parcel ID'),
    geomarkUrl: string().max(255).label('Geomark web service url')
  }),
  [INTAKE_FORM_CATEGORIES.PERMITS]: object({
    hasAppliedProvincialPermits: string().oneOf(YesNoUnsure).required().label('Applied permits'),
    checkProvincialPermits: string().when('hasAppliedProvincialPermits', {
      is: (value: string) => value === BASIC_RESPONSES.YES || value === BASIC_RESPONSES.UNSURE,
      then: (schema) => schema.oneOf(YesNo).required().label('Check permits'),
      otherwise: (schema) => schema.nullable()
    })
  }),
  [INTAKE_FORM_CATEGORIES.APPLIED_PERMITS]: array().of(
    object({
      permitTypeId: number().required().label('Permit type'),
      statusLastVerified: mixed()
        .test(
          'verified-date',
          'Verified date must be valid or empty',
          (val) => val instanceof Date || val === undefined
        )
        .label('Last verified date'),
      trackingId: string().max(255).label('Tracking ID')
    })
  )
});
