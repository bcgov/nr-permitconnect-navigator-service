/*
 * Common initiative enums
 */

export const ActivityContactRole = {
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
  PRIMARY: 'PRIMARY'
} as const;
export type ActivityContactRole = (typeof ActivityContactRole)[keyof typeof ActivityContactRole];

export const ApplicationStatus = {
  NEW: 'New',
  IN_PROGRESS: 'In Progress',
  DELAYED: 'Delayed',
  COMPLETED: 'Completed'
} as const;
export type ApplicationStatus = (typeof ApplicationStatus)[keyof typeof ApplicationStatus];

export const BringForwardType = {
  UNRESOLVED: 'Unresolved',
  RESOLVED: 'Resolved'
} as const;
export type BringForwardType = (typeof BringForwardType)[keyof typeof BringForwardType];

export const ContactPreference = {
  PHONE_CALL: 'Phone call',
  EMAIL: 'Email',
  EITHER: 'Either'
} as const;
export type ContactPreference = (typeof ContactPreference)[keyof typeof ContactPreference];

export const EnquirySubmittedMethod = {
  PHONE: 'Phone',
  EMAIL: 'Email',
  PCNS: 'PCNS'
} as const;
export type EnquirySubmittedMethod = (typeof EnquirySubmittedMethod)[keyof typeof EnquirySubmittedMethod];

export const DraftCode = {
  ELECTRIFICATION_PROJECT: 'ELECTRIFICATION_PROJECT',
  GENERAL_PROJECT: 'GENERAL_PROJECT',
  HOUSING_PROJECT: 'HOUSING_PROJECT'
} as const;
export type DraftCode = (typeof DraftCode)[keyof typeof DraftCode];

export const NoteType = {
  GENERAL: 'General',
  BRING_FORWARD: 'Bring forward',
  ENQUIRY: 'Enquiry',
  ROADMAP: 'Roadmap'
} as const;
export type NoteType = (typeof NoteType)[keyof typeof NoteType];

export const ProjectRelationship = {
  OWNER: 'Property owner',
  CONSULTANT: 'Project consultant',
  OTHER: 'Other'
} as const;
export type ProjectRelationship = (typeof ProjectRelationship)[keyof typeof ProjectRelationship];

export const SubmissionType = {
  ASSISTANCE: 'Assistance',
  ESCALATION: 'Escalation',
  GENERAL_ENQUIRY: 'General enquiry',
  GUIDANCE: 'Guidance',
  INAPPLICABLE: 'Inapplicable',
  STATUS_REQUEST: 'Status request'
} as const;
export type SubmissionType = (typeof SubmissionType)[keyof typeof SubmissionType];
