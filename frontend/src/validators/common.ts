import '@/utils/yupMethods';

import { array, date, mixed, number, object, string } from 'yup';
import { z } from 'zod';

import { YES_NO_LIST, YES_NO_UNSURE_LIST } from '@/utils/constants/application';
import { NUM_RESIDENTIAL_UNITS_LIST } from '@/utils/constants/housing';
import { PROJECT_LOCATION_LIST } from '@/utils/constants/projectCommon';
import { BasicResponse, Regex } from '@/utils/enums/application';
import { ProjectApplicant, ProjectLocation } from '@/utils/enums/projectCommon';
import {
  addIssue,
  evenWithIssues,
  isBlank,
  isOneOf,
  maxMessage,
  oneOfMessage,
  requiredMessage,
  requiredOneOf,
  requiredString,
  requireText
} from '@/utils/zodSchema';

import type { OrgBookOption } from '@/types';

export const assignedToValidator = (message: string, label: string) =>
  mixed()
    .test('expect-user-or-empty', message, (obj) => {
      if (typeof obj === 'object') return true;
      if (typeof obj === 'string') {
        return obj === null || obj === undefined || obj.length === 0;
      }
    })
    .nullable()
    .label(label);

export const atsClientIdValidator = (label: string) => number().nullable().min(0).integer().label(label);

export const emailValidator = (message: string) => string().matches(new RegExp(Regex.EMAIL), message);

export const latitudeValidator = (label: string) => number().notRequired().min(48).max(60).label(label);

export const locationValidator = object({
  naturalDisaster: string().oneOf(YES_NO_LIST).required().label('Natural disaster'),
  projectLocation: string().required().label('Location'),
  streetAddress: string()
    .nullable()
    .when('projectLocation', {
      is: (value: string) => value === ProjectLocation.STREET_ADDRESS,
      then: () => string().required().max(255).label('Street address'),
      otherwise: () => string().nullable()
    }),
  locality: string()
    .nullable()
    .when('projectLocation', {
      is: (value: string) => value === ProjectLocation.STREET_ADDRESS,
      then: () => string().required().max(255).label('Locality'),
      otherwise: () => string().nullable()
    }),
  province: string()
    .nullable()
    .when('projectLocation', {
      is: (value: string) => value === ProjectLocation.STREET_ADDRESS,
      then: () => string().required().max(255).label('Province'),
      otherwise: () => string().nullable()
    }),
  latitude: number()
    .nullable()
    .when('projectLocation', {
      is: (value: string) => value === ProjectLocation.LOCATION_COORDINATES,
      then: () => number().required().min(48).max(60).label('Latitude'),
      otherwise: () => number().nullable().min(48).max(60).label('Latitude')
    }),
  longitude: number()
    .nullable()
    .when('projectLocation', {
      is: (value: string) => value === ProjectLocation.LOCATION_COORDINATES,
      then: () => number().required().min(-139).max(-114).label('Longitude'),
      otherwise: () => number().nullable().min(-139).max(-114).label('Longitude')
    }),
  ltsaPidLookup: string().max(255).nullable().label('Parcel ID'),
  geomarkUrl: string().max(255).nullable().label('Geomark web service url'),
  geoJson: mixed().nullable().label('geoJson'),
  projectLocationDescription: string().nullable()
});

export const longitudeValidator = (label: string) => number().notRequired().min(-139).max(-114).label(label);

export const notInFutureValidator = date().test('not-in-future', 'Date cannot be in the future', (value) => {
  if (!value) return true;
  return value.getTime() <= Date.now();
});

export const appliedPermitsValidator = array().of(
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
);

export const permitsValidator = object({
  appliedPermits: appliedPermitsValidator,
  hasAppliedProvincialPermits: string().oneOf(YES_NO_UNSURE_LIST).required().label('Applied permits'),
  investigatePermits: array().of(
    object({
      permitTypeId: number().required().label('Permit type')
    })
  )
});

export const optionalText = (max?: number) => {
  let schema = string().trim().emptyToNull().nullable();

  if (max) {
    schema = schema.max(max);
  }

  return schema;
};

export const requiredText = (max?: number) => {
  return optionalText(max).required();
};

// zod copies of the shared validators above; each yup version is removed once its last consumer migrates

const blankToNull = (value: unknown) => (typeof value === 'string' ? value.trim() || null : value);

export const toNumber = (value: unknown) => (typeof value === 'string' && value.trim() !== '' ? Number(value) : value);

// Date-only strings parse as local midnight, matching yup
const toDate = (value: unknown) =>
  typeof value === 'string' ? new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00` : value) : value;

const coordinateSchema = (label: string, min: number, max: number) =>
  z.preprocess(
    toNumber,
    z
      .number(`${label} must be a number`)
      .min(min, `${label} must be greater than or equal to ${min}`)
      .max(max, `${label} must be less than or equal to ${max}`)
      .nullish()
  );

const permitTypeIdSchema = z.preprocess(
  toNumber,
  z.number({
    error: (issue) => (isBlank(issue.input) ? requiredMessage('Permit type') : 'Permit type must be a number')
  })
);

export const optionalTextSchema = (label: string, max?: number) =>
  z.preprocess(blankToNull, (max ? z.string().max(max, maxMessage(label, max)) : z.string()).nullish());

export const requiredTextSchema = (label: string, max?: number) =>
  z.preprocess(blankToNull, max ? requiredString(label).max(max, maxMessage(label, max)) : requiredString(label));

// Optional select: blank means unset, anything else must be an allowed value
export const optionalOneOfSchema = <T extends string>(label: string, values: readonly T[]) =>
  z.preprocess(blankToNull, z.enum(values as [T, ...T[]], oneOfMessage(label, values)).nullish());

export const latitudeSchema = (label: string) => coordinateSchema(label, 48, 60);

export const longitudeSchema = (label: string) => coordinateSchema(label, -139, -114);

// A selected user is an object; blank means unassigned; free text left in the autocomplete is invalid
export const assignedToSchema = (message: string) =>
  z.unknown().refine((value) => typeof value === 'object' || value === '', message);

export const atsClientIdSchema = (label: string) =>
  z.preprocess(
    toNumber,
    z
      .number(`${label} must be a number`)
      .int(`${label} must be an integer`)
      .min(0, `${label} must be greater than or equal to 0`)
      .nullish()
  );

export const locationFormSchema = z
  .looseObject({
    naturalDisaster: requiredOneOf('Natural disaster', YES_NO_LIST),
    projectLocation: requiredOneOf('Location', PROJECT_LOCATION_LIST),
    streetAddress: z.string().nullish(),
    locality: z.string().nullish(),
    province: z.string().nullish(),
    latitude: coordinateSchema('Latitude', 48, 60),
    longitude: coordinateSchema('Longitude', -139, -114),
    ltsaPidLookup: z.string().max(255, maxMessage('Parcel ID', 255)).nullish(),
    geomarkUrl: z.string().max(255, maxMessage('Geomark web service url', 255)).nullish(),
    geoJson: z.unknown().optional(),
    projectLocationDescription: z.string().nullish()
  })
  .superRefine((location, ctx) => {
    if (location.projectLocation === ProjectLocation.STREET_ADDRESS) {
      requireText(ctx, 'streetAddress', 'Street address', location.streetAddress);
      requireText(ctx, 'locality', 'Locality', location.locality);
      requireText(ctx, 'province', 'Province', location.province);
    }

    if (location.projectLocation === ProjectLocation.LOCATION_COORDINATES) {
      if (location.latitude == null) addIssue(ctx, 'latitude', requiredMessage('Latitude'));
      if (location.longitude == null) addIssue(ctx, 'longitude', requiredMessage('Longitude'));
    }
  }, evenWithIssues);

export const appliedPermitsFormSchema = z
  .array(
    z.looseObject({
      permitTypeId: permitTypeIdSchema,
      submittedDate: z.preprocess(
        toDate,
        z
          .date({
            error: (issue) =>
              issue.input === null ? 'Submitted date cannot be null' : 'Submitted date must be a valid date'
          })
          .optional()
      ),
      permitTracking: z
        .array(z.looseObject({ trackingId: z.string().max(255, maxMessage('Tracking ID', 255)).nullish() }))
        .optional()
    })
  )
  .optional();

export const permitsFormSchema = z.looseObject({
  appliedPermits: appliedPermitsFormSchema,
  hasAppliedProvincialPermits: requiredOneOf('Applied permits', YES_NO_UNSURE_LIST),
  investigatePermits: z.array(z.looseObject({ permitTypeId: permitTypeIdSchema })).optional()
});

interface BusinessRegistration {
  projectApplicantType?: unknown;
  isDevelopedInBc?: unknown;
  registeredId?: unknown;
  registeredName?: unknown;
}

// Intake basic sections: a business says whether it's registered in BC; a BC registration must match org book
export const refineBusinessRegistration =
  (orgBookOptions: OrgBookOption[]) => (value: BusinessRegistration, ctx: z.RefinementCtx) => {
    if (value.projectApplicantType === ProjectApplicant.BUSINESS && !isOneOf(YES_NO_LIST, value.isDevelopedInBc)) {
      addIssue(
        ctx,
        'isDevelopedInBc',
        value.isDevelopedInBc ? oneOfMessage('Registered in BC', YES_NO_LIST) : requiredMessage('Registered in BC')
      );
    }

    if (value.isDevelopedInBc === BasicResponse.YES) {
      requireText(ctx, 'registeredId', 'Business ID', value.registeredId);
      requireText(ctx, 'registeredName', 'Business name', value.registeredName);
      if (value.registeredId && !orgBookOptions.some((option) => option.registeredId === value.registeredId)) {
        addIssue(ctx, 'registeredId', 'Failed to set the business ID, try selecting the business name again');
      }
      if (value.registeredName && !orgBookOptions.some((option) => option.registeredName === value.registeredName)) {
        addIssue(ctx, 'registeredName', 'Business name must be a valid value from the list of suggestions');
      }
    }
  };

// Optional housing unit count, one of the residential unit ranges when set
export const unitsSchema = (label: string) =>
  z.enum(NUM_RESIDENTIAL_UNITS_LIST, oneOfMessage(label, NUM_RESIDENTIAL_UNITS_LIST)).nullish();

// Housing unit counts: required, and one of the residential unit ranges
export function requireUnits(ctx: z.RefinementCtx, key: string, label: string, value: unknown) {
  if (!value) addIssue(ctx, key, requiredMessage(label));
  else if (!isOneOf(NUM_RESIDENTIAL_UNITS_LIST, value)) {
    addIssue(ctx, key, oneOfMessage(label, NUM_RESIDENTIAL_UNITS_LIST));
  }
}
