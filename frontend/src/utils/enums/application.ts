export enum AccessRequestStatus {
  APPROVED = 'Approved',
  PENDING = 'Pending',
  REJECTED = 'Rejected'
}

export enum Action {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  ROLEOVERRIDE = 'ROLEOVERRIDE'
}

export enum BasicResponse {
  YES = 'Yes',
  NO = 'No',
  UNSURE = 'Unsure'
}

export enum ButtonMode {
  BUTTON,
  ICON
}

export enum FileCategory {
  COMPRESSED = 'compressed',
  DOC = 'doc',
  EMAIL = 'email',
  FILE = 'file',
  IMAGE = 'image',
  PDF = 'pdf',
  SHAPE = 'shape',
  SPREADSHEET = 'spreadsheet'
}

export enum GroupName {
  DEVELOPER = 'DEVELOPER',
  PROPONENT = 'PROPONENT',
  NAVIGATOR = 'NAVIGATOR',
  NAVIGATOR_READ_ONLY = 'NAVIGATOR_READ_ONLY',
  SUPERVISOR = 'SUPERVISOR',
  ADMIN = 'ADMIN'
}

export enum Initiative {
  PCNS = 'PCNS',
  HOUSING = 'HOUSING'
}

export enum Regex {
  // https://emailregex.com/
  // HTML5 - Modified to require domain of at least 2 characters
  EMAIL = '^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]{2,})+$'
}

export enum RouteName {
  CONTACT = 'contact',
  DEVELOPER = 'developer',
  FORBIDDEN = 'forbidden',
  HOME = 'home',
  LOGIN = 'login',

  /*
   * External route names
   */
  EXT_HOUSING = 'ext_housing',
  EXT_HOUSING_ENQUIRY_CONFIRMATION = 'ext_housing_enquiry_confirmation',
  EXT_HOUSING_ENQUIRY = 'ext_housing_enquiry',
  EXT_HOUSING_ENQUIRY_INTAKE = 'ext_housing_enquiry_intake',
  EXT_HOUSING_INTAKE = 'ext_housing_intake',
  EXT_HOUSING_INTAKE_DRAFT = 'ext_housing_intake_draft',
  EXT_HOUSING_INTAKE_CONFIRMATION = 'ext_housing_intake_confirmation',
  EXT_HOUSING_GUIDE = 'ext_housing_guide',
  EXT_HOUSING_PROJECT = 'ext_housing_project',
  EXT_HOUSING_PROJECT_ENQUIRY = 'ext_housing_project_enquiry',
  EXT_HOUSING_PROJECT_ENQUIRY_CONFIRMATION = 'ext_housing_project_enquiry_confirmation',
  EXT_HOUSING_PROJECT_INTAKE = 'ext_housing_project_intake',
  EXT_HOUSING_PROJECT_PERMIT = 'ext_housing_project_permit',
  EXT_HOUSING_PROJECT_PERMIT_ENQUIRY = 'ext_housing_project_permit_enquiry',
  EXT_HOUSING_PROJECT_PERMIT_ENQUIRY_CONFIRMATION = 'ext_housing_project_permit_enquiry_confirmation',
  EXT_HOUSING_PROJECT_RELATED_ENQUIRY = 'ext_housing_project_related_enquiry',
  /*
   * End External route names
   */

  /*
   * Internal route names
   */
  INT_CONTACT = 'int_contact',
  INT_CONTACT_PAGE = 'int_contact_page',
  INT_HOUSING = 'int_housing',
  INT_HOUSING_ENQUIRY = 'int_housing_enquiry',
  INT_HOUSING_PROJECT = 'int_housing_submissions',
  INT_HOUSING_PROJECT_ENQUIRY = 'int_housing_project_enquiry',
  INT_HOUSING_PROJECT_PROPONENT = 'int_housing_project_proponent',
  INT_HOUSING_PROJECT_PROPONENT_PERMIT = 'int_housing_project_proponent_permit',
  INT_USER_MANAGEMENT = 'int_user_management',
  /*
   * End Internal route names
   */

  NOT_FOUND = 'not_found',

  OIDC_CALLBACK = 'oidc_callback',
  OIDC_LOGIN = 'oidc_login',
  OIDC_LOGOUT = 'oidc_logout'
}

export enum IdentityProviderKind {
  IDIR = 'idir',
  BCEID = 'bceidbasic',
  BCEIDBUSINESS = 'bceidbusiness',
  BCSC = 'bcsc'
}

export enum Resource {
  DOCUMENT = 'DOCUMENT',
  ENQUIRY = 'ENQUIRY',
  NAVIGATION = 'NAVIGATION',
  NOTE = 'NOTE',
  PERMIT = 'PERMIT',
  REPORTING = 'REPORTING',
  ROADMAP = 'ROADMAP',
  SSO = 'SSO',
  SUBMISSION = 'SUBMISSION',
  TESTING = 'TESTING',
  USER = 'USER'
}

export enum StorageKey {
  AUTH = 'entrypoint',
  BF_ACCORDION_IDX = 'bf_accordion_idx',
  CONFIG = 'config'
}

export enum ToastTimeout {
  ERROR = 5000,
  INFO = 3000,
  STICKY = 0,
  SUCCESS = 3000,
  WARNING = 5000
}

export enum UserSearchParams {
  FIRST_NAME = 'First name',
  LAST_NAME = 'Last name',
  EMAIL = 'Email'
}
