/** Current user authentication type */
export const AuthType = Object.freeze({
  /** OIDC JWT Authentication header provided */
  BEARER: 'BEARER',
  /** No Authentication header provided */
  NONE: 'NONE'
});

/** Default CORS settings used across the entire application */
export const DEFAULTCORS = Object.freeze({
  /** Tells browsers to cache preflight requests for Access-Control-Max-Age seconds */
  maxAge: 600,
  /** Set true to dynamically set Access-Control-Allow-Origin based on Origin */
  origin: true
});

/**
 * Basic
 */
export const YesNo = Object.freeze({ YES: 'Yes', NO: 'No' });
export const YesNoUnsure = Object.freeze({ YES: 'Yes', NO: 'No', UNSURE: 'Unsure' });

/** Current user authentication types */
export const IdentityProvider = Object.freeze({
  IDIR: 'idir',
  BCEID: 'bceidbasic',
  BCEIDBUSINESS: 'bceidbusiness'
});

/** Current user access role types */
export const AccessRoles = Object.freeze({
  PCNS_ADMIN: 'PCNS_ADMIN',
  PCNS_DEVELOPER: 'PCNS_DEVELOPER',
  PCNS_NAVIGATOR: 'PCNS_NAVIGATOR',
  PCNS_OTHER: 'PCNS_OTHER'
});

/** Current initiative types*/
export const Initiatives = Object.freeze({
  HOUSING: 'HOUSING'
});

/** SHAS form statuses */
export const APPLICATION_STATUS_LIST = Object.freeze({
  NEW: 'New',
  IN_PROGRESS: 'In Progress',
  DELAYED: 'Delayed',
  COMPLETED: 'Completed'
});

export const INTAKE_STATUS_LIST = Object.freeze({
  SUBMITTED: 'Submitted',
  ASSIGNED: 'Assigned',
  COMPLETED: 'Completed',
  DRAFT: 'Draft'
});

export const PERMIT_NEEDED = Object.freeze({
  YES: 'Yes',
  UNDER_INVESTIGATION: 'Under investigation',
  NO: 'No'
});

export const PERMIT_STATUS = Object.freeze({
  NEW: 'New',
  APPLIED: 'Applied',
  COMPLETED: 'Completed'
});

/** Types of notes */
export const NOTE_TYPE_LIST = Object.freeze({
  GENERAL: 'General',
  BRING_FORWARD: 'Bring Forward',
  ENQUIRY: 'Enquiry'
});

/**
 * Generic email regex modified to require domain of at least 2 characters
 * @see {@link https://emailregex.com/}
 */
export const EMAIL_REGEX = '^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]{2,})+$';
export const PHONE_NUMBER_REGEX = '^(\\+\\d{1,2}\\s?)?\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4}$';
/**
 * Basic
 */

export const YES_NO = Object.freeze({
  YES: 'Yes',
  NO: 'No'
});

export const YES_NO_UNSURE = Object.freeze({
  YES: 'Yes',
  NO: 'No',
  UNSURE: 'Unsure'
});

/**
 * Number of residential units
 */

export const NUM_RESIDENTIAL_UNITS = Object.freeze({
  ONE_TO_NINE: '1-9',
  TEN_TO_FOURTY_NINE: '10-49',
  FIFTY_TO_FIVE_HUNDRED: '50-500',
  GREATER_THAN_FIVE_HUNDRED: '>500',
  UNSURE: 'Unsure'
});

/**
 * Max character length for input text boxes
 */

export const TEXT_MAX_LENGTH = 255;

/**
 * Max character length for phone numbers
 */

export const PHONE_NUMBER_MAX_LENGTH = 14;
