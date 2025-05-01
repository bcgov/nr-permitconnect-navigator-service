import {
  ApplicationStatus,
  BringForwardType,
  EnquirySubmittedMethod,
  IntakeStatus,
  NoteType,
  SubmissionType
} from '@/utils/enums/projectCommon';

export const APPLICATION_STATUS_LIST = [
  ApplicationStatus.NEW,
  ApplicationStatus.IN_PROGRESS,
  ApplicationStatus.DELAYED,
  ApplicationStatus.COMPLETED
];

export const BRING_FORWARD_TYPE_LIST = [BringForwardType.UNRESOLVED, BringForwardType.RESOLVED];

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

export const INTAKE_STATUS_LIST = [IntakeStatus.SUBMITTED, IntakeStatus.ASSIGNED, IntakeStatus.COMPLETED];

export const NOTE_TYPE_LIST = [NoteType.GENERAL, NoteType.BRING_FORWARD, NoteType.ENQUIRY, NoteType.ROADMAP];

export const QUEUE_PRIORITY = [1, 2, 3];

export const SUBMISSION_TYPE_LIST = [SubmissionType.GUIDANCE, SubmissionType.INAPPLICABLE];
