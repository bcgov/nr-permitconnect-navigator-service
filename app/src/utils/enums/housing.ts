/*
 * Housing initiative enums
 */

export const NumResidentialUnits = {
  ONE_TO_NINE: '1-9',
  TEN_TO_FOURTY_NINE: '10-49',
  FIFTY_TO_FIVE_HUNDRED: '50-500',
  GREATER_THAN_FIVE_HUNDRED: '>500',
  UNSURE: 'Unsure'
} as const;
export type NumResidentialUnits = (typeof NumResidentialUnits)[keyof typeof NumResidentialUnits];

export const ProjectApplicant = {
  BUSINESS: 'Business',
  INDIVIDUAL: 'Individual'
} as const;
export type ProjectApplicant = (typeof ProjectApplicant)[keyof typeof ProjectApplicant];

export const ProjectLocation = {
  STREET_ADDRESS: 'Street address',
  LOCATION_COORDINATES: 'Location coordinates'
} as const;
export type ProjectLocation = (typeof ProjectLocation)[keyof typeof ProjectLocation];
