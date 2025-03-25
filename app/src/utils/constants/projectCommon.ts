import { ApplicationStatus, IntakeStatus, SubmissionType } from '../enums/projectCommon';

export const APPLICATION_STATUS_LIST = [
  ApplicationStatus.NEW,
  ApplicationStatus.IN_PROGRESS,
  ApplicationStatus.DELAYED,
  ApplicationStatus.COMPLETED
];

export const ENQUIRY_TYPE_LIST = [
  SubmissionType.ASSISTANCE,
  SubmissionType.GENERAL_ENQUIRY,
  SubmissionType.STATUS_REQUEST,
  SubmissionType.ESCALATION,
  SubmissionType.INAPPLICABLE
];

export const INTAKE_STATUS_LIST = [IntakeStatus.SUBMITTED, IntakeStatus.ASSIGNED, IntakeStatus.COMPLETED];
