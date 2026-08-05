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
  siteName: string;
  unitDesignator: string;
  unitNumber: string;
  unitNumberSuffix: string;
  civicNumber: number;
  civicNumberSuffix: string;
  streetName: string;
  streetType: string;
  isStreetTypePrefix: string; // "true" | "false"
  streetDirection: string;
  isStreetDirectionPrefix: string; // "true" | "false"
  streetQualifier: string;
  localityName: string;
  streetAddress: string;
  localityType: string;
  electoralArea: string;
  provinceCode: string;
  locationPositionalAccuracy: string;
  locationDescriptor: string;
  siteID: string;
  blockID: number;
  fullSiteDescriptor: string;
  accessNotes: string;
  siteStatus: string;
  siteRetireDate: string; // ISO date
  changeDate: string; // ISO date
  isOfficial: string; // "true" | "false"
  occupantName: string;
  occupantID: string;
  occupantAliasAddress: string;
  occupantDescription: string;
  contactEmail: string;
  contactPhone: number;
  contactFax: string;
  websiteUrl: string;
  imageUrl: string;
  keywords: string;
  businessCategoryClass: string;
  businessCategoryDescription: string;
  naicsCode: number;
  dateOccupantUpdated: string; // ISO date
  dateOccupantAdded: string; // ISO date
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
 * Request type for Geocoder
 */

export interface GetGeocoderNearestOccupantRequest {
  latitude: string;
  longitude: string;
}

export interface SearchGeocoderAddressRequest {
  addressSearch: string;
}

/*
 * Response type for Geocoder
 */

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GetGeocoderNearestOccupantResponse extends GeocoderFeature {}

export interface SearchGeocoderAddressResponse extends GeocoderResponse {
  type: string;
  queryAddress: string;
  crs: {
    type: string;
    properties: {
      code: number;
    };
  };
  features: GeocoderFeature[];
}
