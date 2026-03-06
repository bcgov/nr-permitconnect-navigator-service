import { array, date, mixed, number, object, string } from 'yup';

import { YES_NO_LIST, YES_NO_UNSURE_LIST } from '@/utils/constants/application';
import { Regex } from '@/utils/enums/application';
import { ProjectLocation } from '@/utils/enums/projectCommon';

export const assignedToValidator = mixed()
  .test('expect-user-or-empty', 'Assigned to must be empty or a selected user', (obj) => {
    if (typeof obj === 'object') return true;
    if (typeof obj === 'string') {
      return obj === null || obj === undefined || obj.length === 0;
    }
  })
  .nullable()
  .label('Assigned to');

export const atsClientIdValidator = number().notRequired().min(0).integer().label('ATS Client #');

export const emailValidator = (message: string) => string().matches(new RegExp(Regex.EMAIL), message);

export const latitudeValidator = number().notRequired().min(48).max(60).label('Latitude');

export const locationValidator = object({
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
});

export const longitudeValidator = number().notRequired().min(-139).max(-114).label('Longitude');

export const notInFutureValidator = date().test('not-in-future', 'Date cannot be in the future', (value) => {
  if (!value) return true;
  return value.getTime() <= Date.now();
});

export const permitsValidator = object({
  appliedPermits: array().of(
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
  hasAppliedProvincialPermits: string().oneOf(YES_NO_UNSURE_LIST).required().label('Applied permits'),
  investigatePermits: array().of(
    object({
      permitTypeId: number().required().label('Permit type')
    })
  )
});
