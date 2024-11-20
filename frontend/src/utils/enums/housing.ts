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
  ISSUED = 'Granted',
  PENDING = 'Pending client action',
  IN_REVIEW = 'In progress',
  DENIED = 'Denied',
  CANCELLED = 'Cancelled',
  WITHDRAWN = 'Withdrawn',
  ABANDONED = 'Abandoned',
  NONE = 'None'
}

export enum PermitNeeded {
  YES = 'Yes',
  UNDER_INVESTIGATION = 'Under investigation',
  NO = 'No'
}

export enum PermitStatus {
  NEW = 'Pre-submission',
  APPLIED = 'Application submission',
  COMPLETED = 'Post-decision',
  TECHNICAL_REVIEW = 'Technical review',
  PENDING = 'Pending decision'
}

export enum PermitTrackerStatus {
  COMPLETED = 'Completed',
  DENIED = 'Denied',
  IN_REVIEW = 'In review',
  ISSUED = 'Issued',
  PENDING = 'Pending',
  SUBMITTED = 'Submitted'
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

export enum SubmissionType {
  ASSISTANCE = 'Assistance',
  ESCALATION = 'Escalation',
  GENERAL_ENQUIRY = 'General enquiry',
  GUIDANCE = 'Guidance',
  INAPPLICABLE = 'Inapplicable',
  STATUS_REQUEST = 'Status request'
}
