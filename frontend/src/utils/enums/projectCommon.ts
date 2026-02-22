/*
 * Common initiative enums
 */

export enum ActivityContactRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  PRIMARY = 'PRIMARY'
}

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

export enum DraftCode {
  ELECTRIFICATION_PROJECT = 'ELECTRIFICATION_PROJECT',
  HOUSING_PROJECT = 'HOUSING_PROJECT'
}

export enum EnquirySubmittedMethod {
  PHONE = 'Phone',
  EMAIL = 'Email',
  PCNS = 'PCNS'
}

export enum FormType {
  NEW = 0,
  DRAFT = 1,
  SUBMISSION = 2
}

export enum FormState {
  LOCKED = 0,
  UNLOCKED = 1
}

export enum IntakeFormCategory {
  BASIC = 'basic',
  CONTACTS = 'contacts',
  GENERAL = 'general',
  HOUSING = 'housing',
  LOCATION = 'location',
  PERMITS = 'permits',
  APPLIED_PERMITS = 'appliedPermits',
  INVESTIGATE_PERMIS = 'investigatePermits'
}

export enum NoteType {
  GENERAL = 'General',
  BRING_FORWARD = 'Bring forward',
  ROADMAP = 'Roadmap'
}

export enum ProjectRelationship {
  OWNER = 'Property owner',
  CONSULTANT = 'Project consultant',
  OTHER = 'Other'
}

export enum SubmissionType {
  ASSISTANCE = 'Assistance',
  ESCALATION = 'Escalation',
  GENERAL_ENQUIRY = 'General enquiry',
  GUIDANCE = 'Guidance',
  INAPPLICABLE = 'Inapplicable',
  STATUS_REQUEST = 'Status request'
}
