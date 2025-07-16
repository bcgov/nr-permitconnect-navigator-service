/*
 * Common initiative enums
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

export enum EnquirySubmittedMethod {
  PHONE = 'Phone',
  EMAIL = 'Email',
  PCNS = 'PCNS'
}

export enum DraftCode {
  ELECTRIFICATION_PROJECT = 'ELECTRIFICATION_PROJECT',
  HOUSING_PROJECT = 'HOUSING_PROJECT'
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
