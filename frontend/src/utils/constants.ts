import { NIL } from 'uuid';

import {
  ACCESS_ROLES,
  APPLICATION_STATUS_LIST,
  BASIC_RESPONSES,
  BRING_FORWARD_TYPES,
  CONTACT_PREFERENCE_LIST,
  INTAKE_STATUS_LIST,
  NOTE_TYPES,
  NUM_RESIDENTIAL_UNITS,
  RENTAL_STATUS_LIST,
  PERMIT_STATUS,
  PERMIT_NEEDED,
  PERMIT_AUTHORIZATION_STATUS,
  PROJECT_LOCATION,
  PROJECT_RELATIONSHIP_LIST
} from '@/utils/enums';

/**
 * Default string delimiter
 */
export const DELIMITER = '/';

export const Regex = Object.freeze({
  // https://emailregex.com/
  // HTML5 - Modified to require domain of at least 2 characters
  EMAIL: '^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]{2,})+$'
});

/**
 * Route names
 */
export const RouteNames = Object.freeze({
  DEVELOPER: 'developer',
  FORBIDDEN: 'forbidden',
  HOME: 'home',

  HOUSING: 'housing',
  HOUSING_ENQUIRY: 'housing_enquiry',
  HOUSING_INTAKE: 'housing_intake',
  HOUSING_SUBMISSION: 'housing_submission',
  HOUSING_SUBMISSIONS: 'housing_submissions',

  OIDC_CALLBACK: 'oidc_callback',
  OIDC_LOGIN: 'oidc_login',
  OIDC_LOGOUT: 'oidc_logout'
});

/**
 * Application storage keys
 */
export const StorageKey = Object.freeze({
  AUTH: 'entrypoint',
  CONFIG: 'config',
  BF_ACCORDION_IDX: 'bf_accordion_idx'
});

/**
 * Default toast message display times
 */
export const ToastTimeout = Object.freeze({
  ERROR: 5000,
  INFO: 3000,
  STICKY: 0,
  SUCCESS: 3000,
  WARNING: 5000
});

/**
 * Basic
 */
export const YesNo = [BASIC_RESPONSES.YES, BASIC_RESPONSES.NO];
export const YesNoUnsure = [BASIC_RESPONSES.YES, BASIC_RESPONSES.NO, BASIC_RESPONSES.UNSURE];

/**
 * Route names
 */
export const AccessRoles = [
  ACCESS_ROLES.PCNS_ADMIN,
  ACCESS_ROLES.PCNS_DEVELOPER,
  ACCESS_ROLES.PCNS_NAVIGATOR,
  ACCESS_ROLES.PCNS_SUPERVISOR
];

/**
 * CHEFS form constants
 */
export const ApplicationStatusList = [
  APPLICATION_STATUS_LIST.NEW,
  APPLICATION_STATUS_LIST.IN_PROGRESS,
  APPLICATION_STATUS_LIST.DELAYED,
  APPLICATION_STATUS_LIST.COMPLETED
];

export const IntakeStatusList = [
  INTAKE_STATUS_LIST.SUBMITTED,
  INTAKE_STATUS_LIST.ASSIGNED,
  INTAKE_STATUS_LIST.COMPLETED
];

export const ProjectRelationshipList = [
  PROJECT_RELATIONSHIP_LIST.OWNER,
  PROJECT_RELATIONSHIP_LIST.EMPLOYEE,
  PROJECT_RELATIONSHIP_LIST.AGENT,
  PROJECT_RELATIONSHIP_LIST.CONSULTANT,
  PROJECT_RELATIONSHIP_LIST.OTHER
];

export const ContactPreferenceList = [
  CONTACT_PREFERENCE_LIST.PHONE_CALL,
  CONTACT_PREFERENCE_LIST.EMAIL,
  CONTACT_PREFERENCE_LIST.EITHER
];

export const RentalStatusList = [RENTAL_STATUS_LIST.UNSURE, RENTAL_STATUS_LIST.NO, RENTAL_STATUS_LIST.YES];

/**
 * Note form constants
 */
export const NoteTypes = [NOTE_TYPES.GENERAL, NOTE_TYPES.BRING_FORWARD, NOTE_TYPES.ENQUIRY, NOTE_TYPES.ROADMAP];

export const BringForwardTypes = [BRING_FORWARD_TYPES.UNRESOLVED, BRING_FORWARD_TYPES.RESOLVED];

export const QueuePriority = [0, 1, 2, 3, 4, 5];

/**
 * Permit form constants
 */
export const PermitAuthorizationStatus = [
  PERMIT_AUTHORIZATION_STATUS.ISSUED,
  PERMIT_AUTHORIZATION_STATUS.DENIED,
  PERMIT_AUTHORIZATION_STATUS.PENDING,
  PERMIT_AUTHORIZATION_STATUS.IN_REVIEW,
  PERMIT_AUTHORIZATION_STATUS.NONE
];

export const PermitNeeded = [PERMIT_NEEDED.YES, PERMIT_NEEDED.UNDER_INVESTIGATION, PERMIT_NEEDED.NO];

export const PermitStatus = [PERMIT_STATUS.NEW, PERMIT_STATUS.APPLIED, PERMIT_STATUS.COMPLETED];

/**
 * Default System User ID
 */
export const SYSTEM_USER = NIL;

/**
 * File category definitions
 */
export const FILE_CATEGORIES = {
  COMPRESSED: 'compressed',
  DOC: 'doc',
  EMAIL: 'email',
  FILE: 'file',
  IMAGE: 'image',
  PDF: 'pdf',
  SHAPE: 'shape',
  SPREADSHEET: 'spreadsheet'
};

/**
 * Number of residential units
 */

export const NumResidentialUnits = [
  NUM_RESIDENTIAL_UNITS.ONE_TO_NINE,
  NUM_RESIDENTIAL_UNITS.TEN_TO_FOURTY_NINE,
  NUM_RESIDENTIAL_UNITS.FIFTY_TO_FIVE_HUNDRED,
  NUM_RESIDENTIAL_UNITS.GREATER_THAN_FIVE_HUNDRED,
  NUM_RESIDENTIAL_UNITS.UNSURE
];

/**
 * Project location
 */

export const ProjectLocation = [PROJECT_LOCATION.LOCATION_COORDINATES, PROJECT_LOCATION.STREET_ADDRESS];

/**
 * External API configuration params
 */
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

export const ORG_BOOK_QUERY_PARAMS = {
  limit: 100,
  skip: 0,
  latest: true,
  inactive: false,
  revoked: false
};
