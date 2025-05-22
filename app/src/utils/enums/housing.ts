/*
 * Housing initiative enums
 */

export enum IntakeFormCategory {
  APPLICANT = 'applicant',
  BASIC = 'basic',
  HOUSING = 'housing',
  LOCATION = 'location',
  PERMITS = 'permits',
  APPLIED_PERMITS = 'appliedPermits'
}

export enum NumResidentialUnits {
  ONE_TO_NINE = '1-9',
  TEN_TO_FOURTY_NINE = '10-49',
  FIFTY_TO_FIVE_HUNDRED = '50-500',
  GREATER_THAN_FIVE_HUNDRED = '>500',
  UNSURE = 'Unsure'
}

export enum ProjectApplicant {
  BUSINESS = 'Business',
  INDIVIDUAL = 'Individual'
}

export enum ProjectLocation {
  STREET_ADDRESS = 'Street address',
  LOCATION_COORDINATES = 'Location coordinates'
}
