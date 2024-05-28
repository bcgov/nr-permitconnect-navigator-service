// Enums that represent general app-wide values

/**
 *  Which way to display a button that can appear in multiple modes
 */
export const enum BUTTON_MODE {
  BUTTON = 'BUTTON',
  ICON = 'ICON'
}

/**
 * Current user access role types
 */
export const enum ACCESS_ROLES {
  PCNS_ADMIN = 'PCNS_ADMIN',
  PCNS_DEVELOPER = 'PCNS_DEVELOPER',
  PCNS_NAVIGATOR = 'PCNS_NAVIGATOR',
  PCNS_PROPONENT = 'PCNS_PROPONENT',
  PCNS_SUPERVISOR = 'PCNS_SUPERVISOR'
}

/**
 * Basic
 */
export const enum BASIC_RESPONSES {
  YES = 'Yes',
  NO = 'No',
  UNSURE = 'Unsure'
}

/**
 * CHEFS form statuses
 */
export const enum APPLICATION_STATUS_LIST {
  NEW = 'New',
  IN_PROGRESS = 'In Progress',
  DELAYED = 'Delayed',
  COMPLETED = 'Completed'
}

export const enum INTAKE_FORM_CATEGORIES {
  APPLICANT = 'applicant',
  BASIC = 'basic',
  HOUSING = 'housing',
  LOCATION = 'location',
  PERMITS = 'permits',
  APPLIED_PERMITS = 'appliedPermits'
}

export const enum INTAKE_STATUS_LIST {
  SUBMITTED = 'Submitted',
  ASSIGNED = 'Assigned',
  COMPLETED = 'Completed',
  DRAFT = 'Draft'
}

export const enum PROJECT_RELATIONSHIP_LIST {
  OWNER = 'Owner',
  EMPLOYEE = 'Employee',
  AGENT = 'Agent',
  CONSULTANT = 'Consultant',
  OTHER = 'Other'
}

export const enum CONTACT_PREFERENCE_LIST {
  PHONE_CALL = 'Phone call',
  EMAIL = 'Email',
  EITHER = 'Either'
}

export const enum RENTAL_STATUS_LIST {
  YES = 'Yes',
  NO = 'No',
  UNSURE = 'Unsure'
}

/**
 * Note types
 */
export const enum NOTE_TYPES {
  GENERAL = 'General',
  BRING_FORWARD = 'Bring forward',
  ENQUIRY = 'Enquiry',
  ROADMAP = 'Roadmap'
}

export const enum BRING_FORWARD_TYPES {
  UNRESOLVED = 'Unresolved',
  RESOLVED = 'Resolved'
}

/**
 * Permit statuses
 */
export const enum PERMIT_AUTHORIZATION_STATUS {
  ISSUED = 'Issued',
  DENIED = 'Denied',
  PENDING = 'Pending',
  IN_REVIEW = 'In Review',
  NONE = 'None'
}

export const enum PERMIT_NEEDED {
  YES = 'Yes',
  UNDER_INVESTIGATION = 'Under investigation',
  NO = 'No'
}

export const enum PERMIT_STATUS {
  NEW = 'New',
  APPLIED = 'Applied',
  COMPLETED = 'Completed'
}

/**
 * Number of residential units
 */
export const enum NUM_RESIDENTIAL_UNITS {
  ONE_TO_NINE = '1-9',
  TEN_TO_FOURTY_NINE = '10-49',
  FIFTY_TO_FIVE_HUNDRED = '50-500',
  GREATER_THAN_FIVE_HUNDRED = '>500',
  UNSURE = 'Unsure'
}

/**
 * Project location selection
 */
export const enum PROJECT_LOCATION {
  STREET_ADDRESS = 'Street address',
  LOCATION_COORDINATES = 'Location coordinates'
}
