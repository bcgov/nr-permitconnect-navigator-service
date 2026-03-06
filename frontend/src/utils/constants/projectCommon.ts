import {
  ApplicationStatus,
  ContactPreference,
  BringForwardType,
  EnquirySubmittedMethod,
  NoteType,
  ProjectApplicant,
  ProjectLocation,
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

export const NOTE_TYPE_LIST = [NoteType.GENERAL, NoteType.BRING_FORWARD, NoteType.ROADMAP];

export const PROJECT_APPLICANT_LIST = [ProjectApplicant.BUSINESS, ProjectApplicant.INDIVIDUAL];

export const PROJECT_LOCATION_LIST = [
  ProjectLocation.LOCATION_COORDINATES,
  ProjectLocation.STREET_ADDRESS,
  ProjectLocation.PIN_OR_DRAW
];

export const PROJECT_RELATIONSHIP_LIST = [
  ProjectRelationship.OWNER,
  ProjectRelationship.CONSULTANT,
  ProjectRelationship.OTHER
];

export const QUEUE_PRIORITY = [1, 2, 3];

export const SUBMISSION_TYPE_LIST = [SubmissionType.GUIDANCE, SubmissionType.INAPPLICABLE];
