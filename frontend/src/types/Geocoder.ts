/*
 * Base query response provided by Geocoder
 * @see {@link https://github.com/bcgov/ols-geocoder/blob/gh-pages/geocoder-developer-guide.md#about-query-representation}
 */
interface GeocoderResponse {
  searchTimestamp: Date;
  executionTime: number;
  version: string;
  minScore: number;
  maxResults: number;
  echo: boolean;
  interpolation: string;
  outputSRS: number;
  setBack: number;
}

/*
 * @see {@link https://github.com/bcgov/ols-geocoder/blob/gh-pages/geocoder-developer-guide.md#site-address-representation}
 */
interface GeocoderAddress {
  fullAddress: string;
  score: number;
  matchPrecision: string;
  precisionPoints: number;
  faults: string;
  siteName: string;
  unitDesignator: string;
  unitNumber: string;
  unitNumberSuffix: string;
  civicNumber: string;
  civicNumberSuffix: string;
  streetName: string;
  streetType: string;
  isStreetTypePrefix: boolean;
  streetDirection: string;
  isStreetDirectionPrefix: boolean;
  streetQualifier: string;
  localityName: string;
  localityType: string;
  electoralArea: string;
  provinceCode: string;
  locationPositionalAccuracy: string;
  locationDescriptor: string;
  siteID: string;
  blockID: string;
  fullSiteDescriptor: string;
  accessNotes: string;
  siteStatus: string;
  siteRetireDate: Date;
  changeDate: string;
  isOfficial: string;
}

export interface GeocoderFeature {
  type: string;
  geometry: {
    type: string;
    crs: {
      type: string;
      properties: {
        code: number;
      };
    };
    coordinates: number[];
  };
  properties: GeocoderAddress;
}

/*
 * Response type for a Geocoder address search
 */
export interface GeocoderAddressResponse extends GeocoderResponse {
  features: GeocoderFeature[];
}
