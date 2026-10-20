import { z } from 'zod';

import { YES_NO_LIST, YES_NO_UNSURE_LIST } from '@/utils/constants/application';
import { NUM_RESIDENTIAL_UNITS_LIST } from '@/utils/constants/housing';
import { PROJECT_LOCATION_LIST } from '@/utils/constants/projectCommon';
import { BasicResponse } from '@/utils/enums/application';
import { ProjectApplicant, ProjectLocation } from '@/utils/enums/projectCommon';
import { coerceDate, coerceNumber, isBlank, isOneOf } from '@/utils/utils';
import {
  addIssue,
  evenWithIssues,
  maxMessage,
  numberRangeSchema,
  oneOfMessage,
  requiredMessage,
  requiredOneOf,
  requireText
} from '@/utils/zodSchema';

import type { OrgBookOption } from '@/types';

const permitTypeIdSchema = z.preprocess(
  coerceNumber,
  z.number({
    error: (issue) => (isBlank(issue.input) ? requiredMessage('Permit type') : 'Permit type must be a number')
  })
);

// BC bounds
export const latitudeSchema = (label: string) => numberRangeSchema(label, 48, 60);

export const longitudeSchema = (label: string) => numberRangeSchema(label, -139, -114);

// A selected user is an object; blank means unassigned; free text left in the autocomplete is invalid
export const assignedToSchema = (message: string) =>
  z.unknown().refine((value) => typeof value === 'object' || value === '', message);

// An ATS client or enquiry number, held to the same rule as the API
export const atsIdSchema = (label: string) =>
  z.preprocess(
    coerceNumber,
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
    latitude: latitudeSchema('Latitude'),
    longitude: longitudeSchema('Longitude'),
    ltsaPidLookup: z.string().max(255, maxMessage('Parcel ID', 255)).nullish(),
    geomarkUrl: z.string().max(255, maxMessage('Geomark web service url', 255)).nullish(),
    geoJson: z.unknown().optional(),
    projectLocationDescription: z.string().max(4000, maxMessage('Location description', 4000)).nullish()
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

export const appliedPermitSchema = z.looseObject({
  permitTypeId: permitTypeIdSchema,
  submittedDate: z.preprocess(
    coerceDate,
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
});

export const appliedPermitsFormSchema = z.array(appliedPermitSchema).optional();

export const permitsFormSchema = z
  .looseObject({
    appliedPermits: appliedPermitsFormSchema,
    hasAppliedProvincialPermits: requiredOneOf('Applied permits', YES_NO_UNSURE_LIST),
    investigatePermits: z.array(z.looseObject({ permitTypeId: permitTypeIdSchema })).optional()
  })
  // The list is hidden on No, so drop any stale entries (e.g. from a draft) the API would reject
  .transform((permits) =>
    permits.hasAppliedProvincialPermits === BasicResponse.NO ? { ...permits, appliedPermits: undefined } : permits
  );

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

// Housing intake and navigator: a financial supporter answered Yes needs its description
export function requireFinanceDescriptions(
  ctx: z.RefinementCtx,
  value: Record<string, unknown>,
  labels: { indigenous: string; nonProfit: string; housingCoop: string }
) {
  if (value.financiallySupportedIndigenous === BasicResponse.YES) {
    requireText(ctx, 'indigenousDescription', labels.indigenous, value.indigenousDescription);
  }
  if (value.financiallySupportedNonProfit === BasicResponse.YES) {
    requireText(ctx, 'nonProfitDescription', labels.nonProfit, value.nonProfitDescription);
  }
  if (value.financiallySupportedHousingCoop === BasicResponse.YES) {
    requireText(ctx, 'housingCoopDescription', labels.housingCoop, value.housingCoopDescription);
  }
}
