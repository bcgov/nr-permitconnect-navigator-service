/*
 * Common initiative enums
 */

export enum ApplicationStatus {
  NEW = 'New',
  IN_PROGRESS = 'In Progress',
  DELAYED = 'Delayed',
  COMPLETED = 'Completed'
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

export enum IntakeStatus {
  SUBMITTED = 'Submitted',
  ASSIGNED = 'Assigned',
  COMPLETED = 'Completed',
  DRAFT = 'Draft'
}

export enum SubmissionType {
  ASSISTANCE = 'Assistance',
  ESCALATION = 'Escalation',
  GENERAL_ENQUIRY = 'General enquiry',
  GUIDANCE = 'Guidance',
  INAPPLICABLE = 'Inapplicable',
  STATUS_REQUEST = 'Status request'
}
