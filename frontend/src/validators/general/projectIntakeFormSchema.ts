import { YES_NO_LIST, YES_NO_UNSURE_LIST } from '@/utils/constants/application';
import { PROJECT_APPLICANT_LIST } from '@/utils/constants/projectCommon';
import { BasicResponse } from '@/utils/enums/application';
import { ProjectApplicant, ProjectLocation } from '@/utils/enums/projectCommon';
import { IntakeFormCategory } from '@/utils/enums/projectCommon';
import { contactValidator } from '@/validators';
import { array, boolean, date, mixed, number, object, string, type InferType } from 'yup';

import type { OrgBookOption } from '@/types';

// Form validation schema
export function createProjectIntakeSchema(orgBookOptions: OrgBookOption[]) {
  return object({
    [IntakeFormCategory.CONTACTS]: object({ ...contactValidator, contactId: string().required() }),
    [IntakeFormCategory.BASIC]: object({
      consentToFeedback: boolean().required().label('Consent to feedback'),
      projectApplicantType: string().required().oneOf(PROJECT_APPLICANT_LIST).label('Project developed'),
      isDevelopedInBc: string().when('projectApplicantType', {
        is: (value: string) => value === ProjectApplicant.BUSINESS,
        then: (schema) => schema.required().oneOf(YES_NO_LIST).label('Registered in BC'),
        otherwise: (schema) => schema.notRequired().nullable().label('Registered in BC')
      }),
      registeredId: string().when('isDevelopedInBc', {
        is: (value: string) => value === BasicResponse.YES,
        then: (schema) =>
          schema
            .required()
            .max(255)
            .test('valid-business-id', 'Business ID must be a valid value from the list of suggestions', (value) => {
              if (!value) return false;
              return orgBookOptions.some((option) => option.registeredId === value);
            })
            .label('Business name'),
        otherwise: (schema) => schema.notRequired().nullable().label('Business ID')
      }),
      registeredName: string().when('isDevelopedInBc', {
        is: (value: string) => value === BasicResponse.YES,
        then: (schema) =>
          schema
            .required()
            .max(255)
            .test(
              'valid-business-name',
              'Business name must be a valid value from the list of suggestions',
              (value) => {
                if (!value) return false;
                return orgBookOptions.some((option) => option.registeredName === value);
              }
            )
            .label('Business name'),
        otherwise: (schema) => schema.notRequired().nullable().label('Business name')
      })
    }),
    [IntakeFormCategory.GENERAL]: object().shape({
      projectName: string().required().max(255).label('Project name'),
      projectDescription: string().required().label('Project description')
    }),
    [IntakeFormCategory.LOCATION]: object({
      naturalDisaster: string().oneOf(YES_NO_LIST).required().label('Natural disaster'),
      projectLocation: string().required().label('Location'),
      streetAddress: string().when('projectLocation', {
        is: (value: string) => value === ProjectLocation.STREET_ADDRESS,
        then: () => string().required().max(255).label('Street address'),
        otherwise: () => string().nullable()
      }),
      locality: string().when('projectLocation', {
        is: (value: string) => value === ProjectLocation.STREET_ADDRESS,
        then: () => string().required().max(255).label('Locality'),
        otherwise: () => string().nullable()
      }),
      province: string().when('projectLocation', {
        is: (value: string) => value === ProjectLocation.STREET_ADDRESS,
        then: () => string().required().max(255).label('Province'),
        otherwise: () => string().nullable()
      }),
      latitude: number().when('projectLocation', {
        is: (value: string) => value === ProjectLocation.LOCATION_COORDINATES,
        then: () => number().required().min(48).max(60).label('Latitude'),
        otherwise: () => number().nullable().min(48).max(60).label('Latitude')
      }),
      longitude: number().when('projectLocation', {
        is: (value: string) => value === ProjectLocation.LOCATION_COORDINATES,
        then: () => number().required().min(-139).max(-114).label('Longitude'),
        otherwise: () => number().nullable().min(-139).max(-114).label('Longitude')
      }),
      ltsaPidLookup: string().max(255).label('Parcel ID'),
      geomarkUrl: string().max(255).label('Geomark web service url'),
      geoJson: mixed().nullable().label('geoJson'),
      projectLocationDescription: string()
    }),
    [IntakeFormCategory.PERMITS]: object({
      hasAppliedProvincialPermits: string().oneOf(YES_NO_UNSURE_LIST).required().label('Applied permits')
    }),
    [IntakeFormCategory.APPLIED_PERMITS]: array().of(
      object({
        permitTypeId: number().required().label('Permit type'),
        submittedDate: date()
          .test(
            'submitted-date',
            'Submitted date must be valid or empty',
            (val) => val instanceof Date || val === undefined
          )
          .label('Submitted date'),
        permitTracking: array().of(object({ trackingId: string().max(255).nullable().label('Tracking ID') }))
      })
    ),
    [IntakeFormCategory.INVESTIGATE_PERMIS]: array().of(
      object({
        permitTypeId: number().required().label('Permit type')
      })
    )
  });
}

export type FormSchemaType = InferType<ReturnType<typeof createProjectIntakeSchema>>;
