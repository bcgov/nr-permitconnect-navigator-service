import { BasicResponse } from '#src/utils/enums/application';
import { ProjectLocation } from '#src/utils/enums/housing';
import { location } from '#src/validators/location';

describe('locationSchema', () => {
  it('should validate a street address location', () => {
    const data = {
      naturalDisaster: BasicResponse.NO,
      projectLocation: ProjectLocation.STREET_ADDRESS,
      streetAddress: '123 Street',
      locality: 'Place',
      province: 'AA'
    };

    const { success } = location.safeParse(data);
    expect(success).toBe(true);
  });

  it('should validate a location coordinates location', () => {
    const data = {
      naturalDisaster: BasicResponse.NO,
      projectLocation: ProjectLocation.LOCATION_COORDINATES,
      latitude: 49,
      longitude: -123
    };

    const { success } = location.safeParse(data);
    expect(success).toBe(true);
  });

  it('should validate a pin-or-draw location with geoJson and no address/coordinates', () => {
    const data = {
      naturalDisaster: BasicResponse.NO,
      projectLocation: ProjectLocation.PIN_OR_DRAW,
      geoJson: { type: 'Point', coordinates: [1, 2] }
    };

    const { success } = location.safeParse(data);
    expect(success).toBe(true);
  });

  it('should require streetAddress, locality, and province for street address', () => {
    const data = {
      naturalDisaster: BasicResponse.NO,
      projectLocation: ProjectLocation.STREET_ADDRESS
    };

    const result = location.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((issue) => issue.path.join('.'));
      expect(paths).toEqual(expect.arrayContaining(['streetAddress', 'locality', 'province']));
    }
  });

  it('should require latitude and longitude for location coordinates', () => {
    const data = {
      naturalDisaster: BasicResponse.NO,
      projectLocation: ProjectLocation.LOCATION_COORDINATES
    };

    const result = location.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((issue) => issue.path.join('.'));
      expect(paths).toEqual(expect.arrayContaining(['latitude', 'longitude']));
    }
  });

  it('should require naturalDisaster and projectLocation', () => {
    const { success } = location.safeParse({});
    expect(success).toBe(false);
  });

  it('should reject an unrecognized projectLocation value', () => {
    const data = {
      naturalDisaster: BasicResponse.NO,
      projectLocation: 'Somewhere else'
    };

    const { success } = location.safeParse(data);
    expect(success).toBe(false);
  });

  it('should reject unknown fields', () => {
    const data = {
      naturalDisaster: BasicResponse.NO,
      projectLocation: ProjectLocation.PIN_OR_DRAW,
      notARealField: true
    };

    const { success } = location.safeParse(data);
    expect(success).toBe(false);
  });
});
