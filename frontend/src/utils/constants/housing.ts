/*
 * Housing initiative constants
 */
import { NumResidentialUnits, ProjectApplicant, ProjectLocation } from '@/utils/enums/housing';

export const ADDRESS_CODER_QUERY_PARAMS = {
  echo: false,
  brief: false,
  minScore: 55,
  onlyCivic: true,
  maxResults: 15,
  autoComplete: true,
  matchAccuracy: 100,
  matchPrecision: 'occupant, unit, site, civic_number, intersection, block, street, locality, province',
  precisionPoints: 100
};

export const HOUSING_ASSISTANCE = {
  email: 'Navigator.Service@gov.bc.ca',
  subject: 'Assistance with Permit Connect Navigator Service'
};

export const NUM_RESIDENTIAL_UNITS_LIST = [
  NumResidentialUnits.ONE_TO_NINE,
  NumResidentialUnits.TEN_TO_FOURTY_NINE,
  NumResidentialUnits.FIFTY_TO_FIVE_HUNDRED,
  NumResidentialUnits.GREATER_THAN_FIVE_HUNDRED,
  NumResidentialUnits.UNSURE
];

export const ORG_BOOK_QUERY_PARAMS = {
  limit: 100,
  skip: 0,
  latest: true,
  inactive: false,
  revoked: false
};

export const PROJECT_APPLICANT_LIST = [ProjectApplicant.BUSINESS, ProjectApplicant.INDIVIDUAL];

export const PROJECT_LOCATION_LIST = [
  ProjectLocation.LOCATION_COORDINATES,
  ProjectLocation.STREET_ADDRESS,
  ProjectLocation.PIN_OR_DRAW
];
