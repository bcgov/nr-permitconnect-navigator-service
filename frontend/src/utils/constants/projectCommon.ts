import {
  ApplicationStatus,
  ContactPreference,
  BringForwardType,
  EnquirySubmittedMethod,
  EscalationType,
  IntakeStatus,
  NoteType,
  ProjectRelationship,
  SubmissionType
} from '@/utils/enums/projectCommon';

export const APPLICATION_STATUS_LIST = [
  ApplicationStatus.NEW,
  ApplicationStatus.IN_PROGRESS,
  ApplicationStatus.DELAYED,
  ApplicationStatus.COMPLETED
];

export const ATS_ENQUIRY_TYPE_CODE_PROJECT_INTAKE_SUFFIX = ' - Project Intake';

export const ATS_ENQUIRY_TYPE_CODE_ENQUIRY_SUFFIX = ' - Enquiry Only';

export const ATS_MANAGING_REGION = 'Navigator Services';

export const BRING_FORWARD_TYPE_LIST = [BringForwardType.UNRESOLVED, BringForwardType.RESOLVED];

export const CONTACT_PREFERENCE_LIST = [
  ContactPreference.PHONE_CALL,
  ContactPreference.EMAIL,
  ContactPreference.EITHER
];

export const ENQUIRY_SUBMITTED_METHOD = [
  EnquirySubmittedMethod.EMAIL,
  EnquirySubmittedMethod.PCNS,
  EnquirySubmittedMethod.PHONE
];

export const ENQUIRY_TYPE_LIST = [
  SubmissionType.ASSISTANCE,
  SubmissionType.GENERAL_ENQUIRY,
  SubmissionType.STATUS_REQUEST,
  SubmissionType.ESCALATION,
  SubmissionType.INAPPLICABLE
];

export const ESCALATION_TYPE_LIST = [
  EscalationType.PROPONENT,
  EscalationType.MINISTRY,
  EscalationType.TIME_SENSITIVE,
  EscalationType.OTHER
];

export const INTAKE_STATUS_LIST = [IntakeStatus.SUBMITTED, IntakeStatus.ASSIGNED, IntakeStatus.COMPLETED];

export const NOTE_TYPE_LIST = [NoteType.GENERAL, NoteType.BRING_FORWARD, NoteType.ENQUIRY, NoteType.ROADMAP];

export const PROJECT_RELATIONSHIP_LIST = [
  ProjectRelationship.OWNER,
  ProjectRelationship.CONSULTANT,
  ProjectRelationship.OTHER
];

export const QUEUE_PRIORITY = [1, 2, 3];

export const SUBMISSION_TYPE_LIST = [SubmissionType.GUIDANCE, SubmissionType.INAPPLICABLE];
