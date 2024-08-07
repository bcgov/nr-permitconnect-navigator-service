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
  COMING_SOON = 'coming_soon',
  DEVELOPER = 'developer',
  FORBIDDEN = 'forbidden',
  HOME = 'home',

  HOUSING = 'housing',
  HOUSING_ENQUIRY = 'housing_enquiry',
  HOUSING_ENQUIRY_INTAKE = 'housing_enquiry_intake',
  HOUSING_GUIDE = 'housing_guide',
  HOUSING_SUBMISSION = 'housing_submission',
  HOUSING_SUBMISSION_INTAKE = 'housing_submission_intake',
  HOUSING_SUBMISSIONS = 'housing_submissions',

  NOT_FOUND = 'not_found',

  OIDC_CALLBACK = 'oidc_callback',
  OIDC_LOGIN = 'oidc_login',
  OIDC_LOGOUT = 'oidc_logout'
}

export enum Resource {
  DOCUMENT = 'DOCUMENT',
  ENQUIRY = 'ENQUIRY',
  NAVIGATION = 'NAVIGATION',
  NOTE = 'NOTE',
  PERMIT = 'PERMIT',
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

export enum GroupName {
  DEVELOPER = 'DEVELOPER',
  PROPONENT = 'PROPONENT',
  NAVIGATOR = 'NAVIGATOR',
  SUPERVISOR = 'SUPERVISOR',
  ADMIN = 'ADMIN'
}
