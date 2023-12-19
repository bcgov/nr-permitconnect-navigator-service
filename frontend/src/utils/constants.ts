import { APPLICATION_STATUS_LIST, INTAKE_STATUS_LIST } from '@/utils/enums';

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
  CONFIG: 'config'
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
 * CHEFS form constants
 */
export const ApplicationStatusList = [
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
 * Default System User ID
 */
export const SYSTEM_USER = '00000000-0000-0000-0000-000000000000';
