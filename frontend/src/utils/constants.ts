import { NIL } from 'uuid';

import {
  ACCESS_ROLES,
  APPLICATION_STATUS_LIST,
  BRING_FORWARD_TYPES,
  INTAKE_STATUS_LIST,
  NOTE_TYPES,
  PERMIT_STATUS,
  PERMIT_NEEDED,
  PERMIT_AUTHORIZATION_STATUS
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
  CALLBACK: 'callback',
  DEVELOPER: 'developer',
  FORBIDDEN: 'forbidden',
  HOME: 'home',
  INITIATIVES: 'initiatives',
  LOGIN: 'login',
  LOGOUT: 'logout',
  SUBMISSION: 'submission',
  SUBMISSIONS: 'submissions',
  STYLINGS: 'stylings'
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
  SUCCESS: 3000,
  WARNING: 5000
});

/**
 * Route names
 */
export const AccessRoles = Object.freeze({
  PCNS_ADMIN: ACCESS_ROLES.PCNS_ADMIN,
  PCNS_DEVELOPER: ACCESS_ROLES.PCNS_DEVELOPER,
  PCNS_NAVIGATOR: ACCESS_ROLES.PCNS_NAVIGATOR,
  PCNS_OTHER: ACCESS_ROLES.PCNS_OTHER
});

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

/**
 * Note form constants
 */
export const NoteTypes = [NOTE_TYPES.GENERAL, NOTE_TYPES.BRING_FORWARD];

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
