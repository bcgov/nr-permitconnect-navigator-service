import { array, boolean, mixed, number, object, string } from 'yup';

import {
  ContactPreferenceList,
  NumResidentialUnits,
  ProjectRelationshipList,
  YesNo,
  YesNoUnsure
} from '@/utils/constants';
import { BASIC_RESPONSES } from '@/utils/enums';

// Form validation schema
const YesNoUnsureSchema = string().required().oneOf(YesNoUnsure);
const prevYesSelected = (prevQuestion: string) => prevQuestion === BASIC_RESPONSES.YES;
const stringRequired = string().required().max(255);

export const getIntakeSchema = (ProjectLocation: Array<string>) =>
  object({
    applicant: object({
      firstName: stringRequired.label('First name'),
      lastName: stringRequired.label('Last name'),
      phoneNumber: stringRequired.label('Phone number'),
      email: stringRequired.label('Email'),
      relationshipToProject: string().required().oneOf(ProjectRelationshipList).label('Relationship to project'),
      contactPreference: string().required().oneOf(ContactPreferenceList).label('Contact Preference')
    }),
    basic: object({
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
    housing: object({
      projectName: stringRequired.label('Project name'),
      projectDescription: string().required().label('Project description'),
      hasRentalUnits: YesNoUnsureSchema.label('Rental units'),
      financiallySupportedBC: YesNoUnsureSchema.label('BC Housing'),
      financiallySupportedIndigenous: YesNoUnsureSchema.label('Indigenous Housing Provider'),
      financiallySupportedNonProfit: YesNoUnsureSchema.label('Non-profit housing society'),
      financiallySupportedHousingCoop: YesNoUnsureSchema.label('Housing co-operative'),
      rentalUnits: string().when('hasRentalUnits', {
        is: prevYesSelected,
        then: () => string().oneOf(NumResidentialUnits).required().label('Expected rental units'),
        otherwise: () => string().nullable()
      }),
      indigenousDescription: string().when('financiallySupportedIndigenous', {
        is: prevYesSelected,
        then: () => stringRequired.label('Indigenous housing provider'),
        otherwise: () => string().nullable()
      }),
      nonProfitDescription: string().when('financiallySupportedNonProfit', {
        is: prevYesSelected,
        then: () => stringRequired.label('Non-profit housing society'),
        otherwise: () => string().nullable()
      }),
      housingCoopDescription: string().when('financiallySupportedHousingCoop', {
        is: prevYesSelected,
        then: () => stringRequired.label('Housing co-operative'),
        otherwise: () => string().nullable()
      }),
      singleFamilySelected: boolean(),
      singleFamilyUnits: string().when('singleFamilySelected', {
        is: (prev: boolean) => prev,
        then: (schema) => schema.required().oneOf(NumResidentialUnits).label('Expected number of single-family units'),
        otherwise: () => string().nullable()
      }),
      multiFamilySelected: boolean(),
      multiFamilyUnits: string().when('multiFamilySelected', {
        is: (prev: boolean) => prev,
        then: (schema) => schema.required().oneOf(NumResidentialUnits).label('Expected number of multi-family units'),
        otherwise: () => string().nullable()
      }),
      otherSelected: boolean(),
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
    }).test('housing-checkbox-test', 'At least one residential type must be selected', (value, context) => {
      return (
        context.originalValue.singleFamilySelected ||
        context.originalValue.multiFamilySelected ||
        context.originalValue.otherSelected
      );
    }),
    location: object({
      projectLocation: string().required().label('Location'),
      streetAddress: string().when('projectLocation', {
        is: (prevQuestion: string) => prevQuestion === ProjectLocation[0],
        then: () => stringRequired.label('Street address'),
        otherwise: () => string().nullable()
      }),
      locality: string().when('projectLocation', {
        is: (prevQuestion: string) => prevQuestion === ProjectLocation[0],
        then: () => stringRequired.label('Locality'),
        otherwise: () => string().nullable()
      }),
      province: string().when('projectLocation', {
        is: (prevQuestion: string) => prevQuestion === ProjectLocation[0],
        then: () => stringRequired.label('Province'),
        otherwise: () => string().nullable()
      }),
      latitude: number().when('projectLocation', {
        is: (prevQuestion: string) => prevQuestion === ProjectLocation[1],
        then: () => number().required().min(48).max(60).label('Latitude'),
        otherwise: () => string().nullable()
      }),
      longitude: number().when('projectLocation', {
        is: (prevQuestion: string) => prevQuestion === ProjectLocation[1],
        then: () => number().required().min(-139).max(-114).label('Longitude'),
        otherwise: () => string().nullable()
      }),
      ltsaPIDLookup: string().max(255).label('Parcel ID'),
      geomarkUrl: string().max(255).label('Geomark web service url')
    }),
    permits: object({
      hasAppliedProvincialPermits: string().oneOf(YesNoUnsure).required().label('Applied permits'),
      checkProvincialPermits: string().when('hasAppliedProvincialPermits', {
        is: (prevQuestion: string) => prevQuestion === BASIC_RESPONSES.YES || prevQuestion === BASIC_RESPONSES.UNSURE,
        then: (schema) => schema.oneOf(YesNo).required().label('Check permits'),
        otherwise: (schema) => schema.nullable()
      })
    }),
    appliedPermits: array().of(
      object({
        permitTypeId: number().required().max(255).label('Permit type'),
        statusLastVerified: mixed()
          .test('verified-date', 'Verified date must be valid', (val) => val instanceof Date)
          .required()
          .label('Last verified date'),
        trackingId: string().max(255).label('Tracking ID')
      })
    )
  });
