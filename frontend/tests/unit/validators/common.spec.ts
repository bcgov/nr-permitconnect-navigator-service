import { runSchema } from '../../helpers';
import {
  appliedPermitsFormSchema,
  assignedToSchema,
  atsClientIdSchema,
  latitudeSchema,
  locationFormSchema,
  longitudeSchema,
  permitsFormSchema
} from '@/validators/common';
import { BasicResponse } from '@/utils/enums/application';
import { ProjectLocation } from '@/utils/enums/projectCommon';

// Mocks

// Fixtures

const streetAddressLocation = {
  naturalDisaster: BasicResponse.YES,
  projectLocation: ProjectLocation.STREET_ADDRESS,
  streetAddress: '1 Main St',
  locality: 'Victoria',
  province: 'BC'
};

const coordinateLocation = {
  naturalDisaster: BasicResponse.NO,
  projectLocation: ProjectLocation.LOCATION_COORDINATES,
  latitude: 51,
  longitude: -120
};

const validPermits = {
  hasAppliedProvincialPermits: BasicResponse.UNSURE,
  appliedPermits: [{ permitTypeId: 1, submittedDate: new Date('2020-01-01'), permitTracking: [{ trackingId: 'T1' }] }],
  investigatePermits: [{ permitTypeId: 2 }]
};

// Mount

// Tests

// Leaf helpers get their label from the caller, so only error presence and output values are pinned here;
// labelled messages are pinned by the composed schema specs
describe('common validators', () => {
  describe('assignedToSchema', () => {
    it.each([[{ userId: 'u1' }], [''], [null]])('accepts %j', async (input) => {
      expect(await runSchema(assignedToSchema('Pick a user'), input)).toEqual({
        value: input,
        errors: {}
      });
    });

    // undefined falls through the custom test without returning true
    it.each([['bob'], [undefined]])('rejects %j with the given message', async (input) => {
      expect((await runSchema(assignedToSchema('Pick a user'), input)).errors).toEqual({
        '': 'Pick a user'
      });
    });
  });

  describe('atsClientIdSchema', () => {
    it.each([
      [1, 1],
      [0, 0],
      ['3', 3],
      [null, null]
    ])('accepts %j and outputs %j', async (input, output) => {
      expect(await runSchema(atsClientIdSchema('ATS'), input)).toEqual({ value: output, errors: {} });
    });

    it.each([
      [-1, 'ATS must be greater than or equal to 0'],
      [1.5, 'ATS must be an integer']
    ])('rejects %j', async (input, message) => {
      expect((await runSchema(atsClientIdSchema('ATS'), input)).errors).toEqual({ '': message });
    });

    it('rejects non-numeric strings', async () => {
      expect(Object.keys((await runSchema(atsClientIdSchema('ATS'), 'x')).errors)).toEqual(['']);
    });
  });

  describe('latitudeSchema / longitudeSchema', () => {
    it.each([
      [48, 48],
      [60, 60],
      ['51', 51],
      [null, null],
      [undefined, undefined]
    ])('latitude accepts %j and outputs %j', async (input, output) => {
      expect(await runSchema(latitudeSchema('Lat'), input)).toEqual({ value: output, errors: {} });
    });

    it.each([
      [47.9, 'Lat must be greater than or equal to 48'],
      [60.1, 'Lat must be less than or equal to 60']
    ])('latitude rejects %j', async (input, message) => {
      expect((await runSchema(latitudeSchema('Lat'), input)).errors).toEqual({ '': message });
    });

    it('latitude rejects an empty string', async () => {
      expect(Object.keys((await runSchema(latitudeSchema('Lat'), '')).errors)).toEqual(['']);
    });

    it.each([
      [-139, -139],
      [-114, -114],
      ['-120', -120],
      [undefined, undefined]
    ])('longitude accepts %j and outputs %j', async (input, output) => {
      expect(await runSchema(longitudeSchema('Long'), input)).toEqual({ value: output, errors: {} });
    });

    it.each([
      [-140, 'Long must be greater than or equal to -139'],
      [-113, 'Long must be less than or equal to -114']
    ])('longitude rejects %j', async (input, message) => {
      expect((await runSchema(longitudeSchema('Long'), input)).errors).toEqual({ '': message });
    });
  });

  describe('locationFormSchema', () => {
    it('requires natural disaster and location', async () => {
      expect((await runSchema(locationFormSchema, {})).errors).toEqual({
        naturalDisaster: 'Natural disaster is a required field',
        projectLocation: 'Location is a required field'
      });
    });

    it('accepts a complete street address', async () => {
      expect(await runSchema(locationFormSchema, streetAddressLocation)).toEqual({
        value: streetAddressLocation,
        errors: {}
      });
    });

    it('requires address fields for a street address location', async () => {
      const { naturalDisaster, projectLocation } = streetAddressLocation;

      expect((await runSchema(locationFormSchema, { naturalDisaster, projectLocation })).errors).toEqual({
        streetAddress: 'Street address is a required field',
        locality: 'Locality is a required field',
        province: 'Province is a required field'
      });
    });

    it('max-checks address fields only for a street address location', async () => {
      const long = 'a'.repeat(256);

      expect((await runSchema(locationFormSchema, { ...streetAddressLocation, streetAddress: long })).errors).toEqual({
        streetAddress: 'Street address must be at most 255 characters'
      });
      expect((await runSchema(locationFormSchema, { ...coordinateLocation, streetAddress: long })).errors).toEqual({});
    });

    it('casts numeric strings for coordinates', async () => {
      expect(
        (await runSchema(locationFormSchema, { ...coordinateLocation, latitude: '51', longitude: '-120' })).value
      ).toEqual(coordinateLocation);
    });

    it('requires coordinates for a coordinate location', async () => {
      const { naturalDisaster, projectLocation } = coordinateLocation;

      expect((await runSchema(locationFormSchema, { naturalDisaster, projectLocation })).errors).toEqual({
        latitude: 'Latitude is a required field',
        longitude: 'Longitude is a required field'
      });
    });

    it('bounds-checks coordinates for a coordinate location', async () => {
      expect(
        (await runSchema(locationFormSchema, { ...coordinateLocation, latitude: 12, longitude: -100 })).errors
      ).toEqual({
        latitude: 'Latitude must be greater than or equal to 48',
        longitude: 'Longitude must be less than or equal to -114'
      });
    });

    it('still bounds-checks optional coordinates for other location types', async () => {
      expect(
        (
          await runSchema(locationFormSchema, {
            naturalDisaster: BasicResponse.NO,
            projectLocation: ProjectLocation.PIN_OR_DRAW,
            latitude: 12
          })
        ).errors
      ).toEqual({ latitude: 'Latitude must be greater than or equal to 48' });
    });

    it('rejects invalid natural disaster values and long lookup fields', async () => {
      expect(
        (
          await runSchema(locationFormSchema, {
            naturalDisaster: 'Maybe',
            projectLocation: ProjectLocation.PIN_OR_DRAW,
            ltsaPidLookup: 'a'.repeat(256),
            geomarkUrl: 'a'.repeat(256)
          })
        ).errors
      ).toEqual({
        naturalDisaster: 'Natural disaster must be one of the following values: Yes, No',
        ltsaPidLookup: 'Parcel ID must be at most 255 characters',
        geomarkUrl: 'Geomark web service url must be at most 255 characters'
      });
    });
  });

  describe('permitsFormSchema', () => {
    it('requires hasAppliedProvincialPermits', async () => {
      expect((await runSchema(permitsFormSchema, {})).errors).toEqual({
        hasAppliedProvincialPermits: 'Applied permits is a required field'
      });
    });

    it('accepts well-formed permits', async () => {
      expect(await runSchema(permitsFormSchema, validPermits)).toEqual({ value: validPermits, errors: {} });
    });

    it('casts string permit type ids and submitted dates', async () => {
      expect(
        (
          await runSchema(permitsFormSchema, {
            hasAppliedProvincialPermits: BasicResponse.YES,
            appliedPermits: [{ permitTypeId: '1', submittedDate: '2020-01-01' }]
          })
        ).value
      ).toEqual({
        hasAppliedProvincialPermits: BasicResponse.YES,
        appliedPermits: [{ permitTypeId: 1, submittedDate: new Date('2020-01-01T00:00') }]
      });
    });

    it('rejects malformed permits at their nested paths', async () => {
      const { errors } = await runSchema(permitsFormSchema, {
        hasAppliedProvincialPermits: 123,
        appliedPermits: [
          { permitTypeId: '', submittedDate: 'garbage', permitTracking: [{ trackingId: 'a'.repeat(256) }] }
        ],
        investigatePermits: [{}]
      });

      expect(Object.keys(errors).sort()).toEqual([
        'appliedPermits.0.permitTracking.0.trackingId',
        'appliedPermits.0.permitTypeId',
        'appliedPermits.0.submittedDate',
        'hasAppliedProvincialPermits',
        'investigatePermits.0.permitTypeId'
      ]);
      expect(errors).toMatchObject({
        'appliedPermits.0.permitTracking.0.trackingId': 'Tracking ID must be at most 255 characters',
        hasAppliedProvincialPermits: 'Applied permits must be one of the following values: Yes, No, Unsure',
        'investigatePermits.0.permitTypeId': 'Permit type is a required field'
      });
    });

    it('rejects a null submitted date', async () => {
      expect((await runSchema(appliedPermitsFormSchema, [{ permitTypeId: 1, submittedDate: null }])).errors).toEqual({
        '0.submittedDate': 'Submitted date cannot be null'
      });
    });
  });
});
