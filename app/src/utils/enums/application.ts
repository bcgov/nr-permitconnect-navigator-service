export enum Action {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE'
}

/** Current user authentication type */
export enum AuthType {
  /** OIDC JWT Authentication header provided */
  BEARER = 'BEARER',
  /** No Authentication header provided */
  NONE = 'NONE'
}

export enum BasicResponse {
  YES = 'Yes',
  NO = 'No',
  UNSURE = 'Unsure'
}

export enum IdentityProvider {
  IDIR = 'idir',
  BCEID = 'bceidbasic',
  BCEIDBUSINESS = 'bceidbusiness'
}

export enum Initiative {
  PCNS = 'PCNS',
  ELECTRIFICATION = 'ELECTRIFICATION',
  HOUSING = 'HOUSING'
}

export enum AccessRequestStatus {
  APPROVED = 'Approved',
  PENDING = 'Pending',
  REJECTED = 'Rejected'
}

export enum Regex {
  /**
   * Generic email regex modified to require domain of at least 2 characters
   * @see {@link https://emailregex.com/}
   */
  EMAIL = '^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]{2,})+$',
  PHONE_NUMBER = '^(\\+\\d{1,2}\\s?)?\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4}$'
}

export enum Resource {
  ACCESS_REQUEST = 'ACCESS_REQUEST',
  ATS = 'ATS',
  CONTACT = 'CONTACT',
  DOCUMENT = 'DOCUMENT',
  ELECTRIFICATION_PROJECT = 'ELECTRIFICATION_PROJECT',
  ENQUIRY = 'ENQUIRY',
  HOUSING_PROJECT = 'HOUSING_PROJECT',
  NOTE = 'NOTE',
  PERMIT = 'PERMIT',
  REPORTING = 'REPORTING',
  ROADMAP = 'ROADMAP',
  SSO = 'SSO',
  USER = 'USER',
  YARS = 'YARS'
}

// Legacy resources that are kept for migration purposes
export enum ResourceLegacy {
  SUBMISSION = 'SUBMISSION'
}

export enum GroupName {
  DEVELOPER = 'DEVELOPER',
  PROPONENT = 'PROPONENT',
  NAVIGATOR = 'NAVIGATOR',
  NAVIGATOR_READ_ONLY = 'NAVIGATOR_READ_ONLY',
  SUPERVISOR = 'SUPERVISOR',
  ADMIN = 'ADMIN'
}
