export const Action = {
  CREATE: 'CREATE',
  READ: 'READ',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE'
} as const;
export type Action = (typeof Action)[keyof typeof Action];

/** Current user authentication type */
export const AuthType = {
  /** OIDC JWT Authentication header provided */
  BEARER: 'BEARER',
  /** No Authentication header provided */
  NONE: 'NONE'
} as const;
export type AuthType = (typeof AuthType)[keyof typeof AuthType];

export const BasicResponse = {
  YES: 'Yes',
  NO: 'No',
  UNSURE: 'Unsure'
} as const;
export type BasicResponse = (typeof BasicResponse)[keyof typeof BasicResponse];

export const IdentityProviderKind = {
  AZUREIDIR: 'azureidir',
  BCEID: 'bceidbasic',
  BCEIDBUSINESS: 'bceidbusiness',
  BCSC: 'bcsc'
} as const;
export type IdentityProviderKind = (typeof IdentityProviderKind)[keyof typeof IdentityProviderKind];

export const Initiative = {
  PCNS: 'PCNS',
  ELECTRIFICATION: 'ELECTRIFICATION',
  GENERAL: 'GENERAL',
  HOUSING: 'HOUSING'
} as const;
export type Initiative = (typeof Initiative)[keyof typeof Initiative];

export const AccessRequestStatus = {
  APPROVED: 'Approved',
  PENDING: 'Pending',
  REJECTED: 'Rejected'
} as const;
export type AccessRequestStatus = (typeof AccessRequestStatus)[keyof typeof AccessRequestStatus];

export const Regex = {
  /**
   * Generic email regex modified to require domain of at least 2 characters
   * @see {@link https://emailregex.com/}
   */
  DATE_ONLY: '^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$',
  EMAIL: '^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]{2,})+$',
  PHONE_NUMBER: '^(\\+\\d{1,2}\\s?)?\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4}$',
  TIMETZ: '^([01]?[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])(\\.\\d{1,7})?Z$'
} as const;
export type Regex = (typeof Regex)[keyof typeof Regex];

export const Resource = {
  ACCESS_REQUEST: 'ACCESS_REQUEST',
  ACTIVITY_CONTACT: 'ACTIVITY_CONTACT',
  ATS: 'ATS',
  CONTACT: 'CONTACT',
  DOCUMENT: 'DOCUMENT',
  ELECTRIFICATION_PROJECT: 'ELECTRIFICATION_PROJECT',
  ENQUIRY: 'ENQUIRY',
  GENERAL_PROJECT: 'GENERAL_PROJECT',
  HOUSING_PROJECT: 'HOUSING_PROJECT',
  NOTE: 'NOTE',
  PEACH: 'PEACH',
  PERMIT: 'PERMIT',
  PERMIT_TYPE: 'PERMIT_TYPE',
  REPORTING: 'REPORTING',
  ROADMAP: 'ROADMAP',
  SSO: 'SSO',
  USER: 'USER',
  YARS: 'YARS'
} as const;
export type Resource = (typeof Resource)[keyof typeof Resource];

// Legacy resources that are kept for migration purposes
export const ResourceLegacy = {
  SUBMISSION: 'SUBMISSION'
} as const;
export type ResourceLegacy = (typeof ResourceLegacy)[keyof typeof ResourceLegacy];

export const GroupName = {
  DEVELOPER: 'DEVELOPER',
  PROPONENT: 'PROPONENT',
  NAVIGATOR: 'NAVIGATOR',
  NAVIGATOR_READ_ONLY: 'NAVIGATOR_READ_ONLY',
  SUPERVISOR: 'SUPERVISOR',
  ADMIN: 'ADMIN'
} as const;
export type GroupName = (typeof GroupName)[keyof typeof GroupName];
