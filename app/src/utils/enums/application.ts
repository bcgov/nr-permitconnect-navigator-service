export enum AccessRole {
  PCNS_ADMIN = 'PCNS_ADMIN',
  PCNS_DEVELOPER = 'PCNS_DEVELOPER',
  PCNS_NAVIGATOR = 'PCNS_NAVIGATOR',
  PCNS_PROPONENT = 'PCNS_PROPONENT',
  PCNS_SUPERVISOR = 'PCNS_SUPERVISOR'
}

export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete'
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
  HOUSING = 'HOUSING'
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
  DOCUMENT = 'document',
  ENQUIRY = 'enquiry',
  NOTE = 'note',
  PERMIT = 'permit',
  ROADMAP = 'roadmap',
  SSO = 'sso',
  SUBMISSION = 'submission',
  USER = 'user'
}

export enum Scope {
  ALL = 'all',
  SELF = 'self'
}
