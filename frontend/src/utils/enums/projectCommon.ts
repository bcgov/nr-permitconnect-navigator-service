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

export const Area = {
  COAST: 'Coast',
  NORTH: 'North',
  SOUTH: 'South'
} as const;

export type Area = (typeof Area)[keyof typeof Area];

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

export const DraftCode = {
  ELECTRIFICATION_PROJECT: 'ELECTRIFICATION_PROJECT',
  HOUSING_PROJECT: 'HOUSING_PROJECT'
} as const;

export type DraftCode = (typeof DraftCode)[keyof typeof DraftCode];

export const EnquirySubmittedMethod = {
  PHONE: 'Phone',
  EMAIL: 'Email',
  PCNS: 'PCNS'
} as const;

export type EnquirySubmittedMethod = (typeof EnquirySubmittedMethod)[keyof typeof EnquirySubmittedMethod];

export const FormType = {
  NEW: 0,
  DRAFT: 1,
  SUBMISSION: 2,
  NAVIGATOR: 3
} as const;

export type FormType = (typeof FormType)[keyof typeof FormType];

export const FormState = {
  LOCKED: 0,
  UNLOCKED: 1
} as const;

export type FormState = (typeof FormState)[keyof typeof FormState];

export const IntakeFormCategory = {
  BASIC: 'basic',
  CONTACTS: 'contacts',
  HOUSING: 'housing',
  LOCATION: 'location',
  PERMITS: 'permits'
} as const;

export type IntakeFormCategory = (typeof IntakeFormCategory)[keyof typeof IntakeFormCategory];

export const NoteType = {
  GENERAL: 'General',
  BRING_FORWARD: 'Bring forward',
  ROADMAP: 'Roadmap'
} as const;

export type NoteType = (typeof NoteType)[keyof typeof NoteType];

export const ProjectApplicant = {
  BUSINESS: 'Business',
  INDIVIDUAL: 'Individual'
} as const;

export type ProjectApplicant = (typeof ProjectApplicant)[keyof typeof ProjectApplicant];

export const ProjectLocation = {
  STREET_ADDRESS: 'Street address',
  LOCATION_COORDINATES: 'Location coordinates',
  PIN_OR_DRAW: 'Pin or draw your location'
} as const;

export type ProjectLocation = (typeof ProjectLocation)[keyof typeof ProjectLocation];

export const ProjectRelationship = {
  OWNER: 'Property owner',
  CONSULTANT: 'Project consultant',
  OTHER: 'Other'
} as const;

export type ProjectRelationship = (typeof ProjectRelationship)[keyof typeof ProjectRelationship];

export const Region = {
  CARIBOO: 'Cariboo',
  KOOTENAY_BOUNDARY: 'Kootenay-Boundary',
  NORTHEAST: 'Northeast',
  OMINERCA: 'Ominerca',
  SKEENA: 'Skeena',
  SOUTH_COAST: 'South Coast',
  THOMPSON_OKANAGAN: 'Thompson-Okanagan',
  WEST_COAST: 'West Coast'
} as const;

export type Region = (typeof Region)[keyof typeof Region];

export const SubmissionType = {
  ASSISTANCE: 'Assistance',
  ESCALATION: 'Escalation',
  GENERAL_ENQUIRY: 'General enquiry',
  GUIDANCE: 'Guidance',
  INAPPLICABLE: 'Inapplicable',
  STATUS_REQUEST: 'Status request'
} as const;

export type SubmissionType = (typeof SubmissionType)[keyof typeof SubmissionType];
