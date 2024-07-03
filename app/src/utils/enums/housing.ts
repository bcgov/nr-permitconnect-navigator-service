/*
 * Housing initiative enums
 */

export enum ApplicationStatus {
  NEW = 'New',
  IN_PROGRESS = 'In Progress',
  DELAYED = 'Delayed',
  COMPLETED = 'Completed'
}

export enum BringForwardType {
  UNRESOLVED = 'Unresolved',
  RESOLVED = 'Resolved'
}

export enum ContactPreference {
  PHONE_CALL = 'Phone call',
  EMAIL = 'Email',
  EITHER = 'Either'
}

export enum IntakeFormCategory {
  APPLICANT = 'applicant',
  BASIC = 'basic',
  HOUSING = 'housing',
  LOCATION = 'location',
  PERMITS = 'permits',
  APPLIED_PERMITS = 'appliedPermits'
}

export enum IntakeStatus {
  SUBMITTED = 'Submitted',
  ASSIGNED = 'Assigned',
  COMPLETED = 'Completed',
  DRAFT = 'Draft'
}

export enum NoteType {
  GENERAL = 'General',
  BRING_FORWARD = 'Bring forward',
  ENQUIRY = 'Enquiry',
  ROADMAP = 'Roadmap'
}

export enum NumResidentialUnits {
  ONE_TO_NINE = '1-9',
  TEN_TO_FOURTY_NINE = '10-49',
  FIFTY_TO_FIVE_HUNDRED = '50-500',
  GREATER_THAN_FIVE_HUNDRED = '>500',
  UNSURE = 'Unsure'
}

export enum PermitAuthorizationStatus {
  ISSUED = 'Issued',
  DENIED = 'Denied',
  PENDING = 'Pending',
  IN_REVIEW = 'In Review',
  NONE = 'None'
}

export enum PermitNeeded {
  YES = 'Yes',
  UNDER_INVESTIGATION = 'Under investigation',
  NO = 'No'
}

export enum PermitStatus {
  NEW = 'New',
  APPLIED = 'Applied',
  COMPLETED = 'Completed'
}

export enum ProjectRelationship {
  OWNER = 'Owner',
  EMPLOYEE = 'Employee',
  AGENT = 'Agent',
  CONSULTANT = 'Consultant',
  OTHER = 'Other'
}

export enum ProjectLocation {
  STREET_ADDRESS = 'Street address',
  LOCATION_COORDINATES = 'Location coordinates'
}

export enum SubmissionPriorityOneCriteria {
  HAS_RENTALS = 'Yes',
  /* allowing duplicated values as these are separate criteria and maybe be different/changed in future */
  /* eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values */
  SOCIAL_HOUSING = 'Yes',
  /* eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values */
  INDIGENOUS_LED = 'Yes',
  SINGLE_FAM_UNITS_1 = '>500',
  SINGLE_FAM_UNITS_2 = '50-500',
  /* eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values */
  MULTI_FAM_UNITS_1 = '>500',
  /* eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values */
  MULTI_FAM_UNITS_2 = '50-500',
  /* eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values */
  OTHER_UNITS_1 = '>500',
  /* eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values */
  OTHER_UNITS_2 = '50-500'
}

export enum SubmissionPriorityTwoCriteria {
  SINGLE_FAM_UNITS = '10-49',
  /* eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values */
  MULTI_FAM_UNITS_1 = '10-49',
  MULTI_FAM_UNITS_2 = '1-9',
  /* eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values */
  OTHER_UNITS_1 = '10-49',
  /* eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values */
  OTHER_UNITS_2 = '1-9'
}

export enum SubmissionType {
  ESCALATION = 'Escalation',
  GENERAL_ENQUIRY = 'General enquiry',
  GUIDANCE = 'Guidance',
  INAPPLICABLE = 'Inapplicable',
  STATUS_REQUEST = 'Status request'
}
