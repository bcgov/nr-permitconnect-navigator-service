/**
 * Use these directly or destructure them and make any necessary data changes locally in a test.
 * DO NOT change the existing objects in this file unless a schema change is required.
 * If you need something wildly different than the existing ones then add new ones.
 */
import { Prisma } from '@prisma/client';

import {
  Activity,
  ActivityContact,
  Contact,
  CurrentContext,
  Document,
  Draft,
  ElectrificationProject,
  ElectrificationProjectIntake,
  Email,
  Enquiry,
  EnquiryIntake,
  HousingProject,
  HousingProjectIntake,
  Initiative as InitiativeModel,
  Note,
  NoteHistory,
  Record as PeachRecord,
  PeachSummary,
  Permit,
  PermitNote,
  PermitType,
  User
} from '../../../src/types';
import { AuthType, BasicResponse, IdentityProvider, Initiative } from '../../../src/utils/enums/application';
import { ProjectType } from '../../../src/utils/enums/electrification';
import { PeachIntegratedSystem, PermitNeeded, PermitStage, PermitState } from '../../../src/utils/enums/permit';
import {
  ActivityContactRole,
  ApplicationStatus,
  ContactPreference,
  DraftCode,
  EnquirySubmittedMethod,
  IntakeStatus,
  NoteType,
  ProjectRelationship,
  SubmissionType
} from '../../../src/utils/enums/projectCommon';
import { NumResidentialUnits } from '../../../src/utils/enums/housing';

export const TEST_ACTIVITY_CONTACT_1: ActivityContact = {
  activityId: 'ACTI1234',
  contactId: '59b6bad3-ed3c-43f6-81f9-bbd1609d880f',
  role: ActivityContactRole.PRIMARY,
  createdAt: null,
  createdBy: null,
  updatedBy: null,
  updatedAt: null,
  deletedBy: null,
  deletedAt: null
};

export const TEST_ACTIVITY_ELECTRIFICATION: Activity = {
  activityId: 'ACTI1234',
  initiativeId: Initiative.ELECTRIFICATION,
  createdAt: null,
  createdBy: null,
  updatedAt: null,
  updatedBy: null,
  deletedBy: null,
  deletedAt: null
};

export const TEST_ACTIVITY_HOUSING: Activity = {
  activityId: 'ACTI1234',
  initiativeId: Initiative.HOUSING,
  createdAt: null,
  createdBy: null,
  updatedAt: null,
  updatedBy: null,
  deletedBy: null,
  deletedAt: null
};

export const TEST_CONTACT_1: Contact = {
  contactId: '59b6bad3-ed3c-43f6-81f9-bbd1609d880f',
  userId: '5e3f0c19-8664-4a43-ac9e-210da336e923',
  firstName: 'John',
  lastName: 'Doe',
  phoneNumber: '123-456-7890',
  email: 'John.Doe@example.com',
  contactPreference: ContactPreference.EMAIL,
  contactApplicantRelationship: ProjectRelationship.OWNER,
  createdAt: null,
  createdBy: null,
  updatedBy: null,
  updatedAt: null,
  deletedBy: null,
  deletedAt: null
};

export const TEST_CONTACT_NO_ID = {
  ...TEST_CONTACT_1,
  contactId: null
};

export const TEST_CONTACT_WITH_ACTIVITY_1: Contact = {
  ...TEST_CONTACT_1,
  activityContact: [TEST_ACTIVITY_CONTACT_1]
};

export const TEST_CURRENT_CONTEXT: CurrentContext = {
  authType: AuthType.BEARER,
  userId: '811896a0-e1fe-4c38-8cd3-86245c79e8f8'
};

export const TEST_DOCUMENT_1: Document = {
  documentId: 'fdbe13d4-e90f-4119-9b10-d5ed08ad1d6d',
  activityId: 'ACTI1234',
  filename: 'testfile',
  mimeType: 'imgjpg',
  filesize: 1234567,
  createdByFullName: undefined,
  createdAt: null,
  createdBy: null,
  updatedBy: null,
  updatedAt: null,
  deletedBy: null,
  deletedAt: null
};

export const TEST_ELECTRIFICATION_DRAFT: Draft = {
  draftId: '0a339ab8-4a87-42d9-8d83-5f169de4a102',
  activityId: 'ACTI1234',
  data: {} as Prisma.JsonValue,
  draftCode: DraftCode.ELECTRIFICATION_PROJECT,
  createdAt: null,
  createdBy: null,
  updatedAt: null,
  updatedBy: null,
  deletedBy: null,
  deletedAt: null
};

export const TEST_ELECTRIFICATION_INTAKE: ElectrificationProjectIntake = {
  project: {
    projectName: 'NAME',
    projectDescription: 'DESCRIPTION',
    companyIdRegistered: 'FM0281610',
    companyNameRegistered: 'COMPANY',
    projectType: ProjectType.IPP_WIND,
    bcHydroNumber: '12345',
    submissionType: SubmissionType.GUIDANCE
  },
  contact: TEST_CONTACT_1
};

export const TEST_ELECTRIFICATION_PROJECT_1: ElectrificationProject = {
  electrificationProjectId: '5183f223-526a-44cf-8b6a-80f90c4e802b',
  activityId: 'ACTI1234',
  assignedUserId: null,
  submittedAt: new Date(),
  intakeStatus: IntakeStatus.SUBMITTED,
  aaiUpdated: false,
  addedToAts: false,
  applicationStatus: ApplicationStatus.NEW,
  astNotes: null,
  atsClientId: null,
  atsEnquiryId: null,
  bcEnvironmentAssessNeeded: null,
  bcHydroNumber: '12345',
  companyIdRegistered: 'FM0281610',
  companyNameRegistered: 'COMPANY',
  hasEpa: null,
  locationDescription: null,
  megawatts: null,
  projectCategory: null,
  projectDescription: 'DESCRIPTION',
  projectName: 'NAME',
  projectType: ProjectType.IPP_WIND,
  queuePriority: null,
  submissionType: SubmissionType.GUIDANCE,
  createdAt: null,
  createdBy: null,
  updatedAt: null,
  updatedBy: null,
  deletedBy: null,
  deletedAt: null
};

export const TEST_ELECTRIFICATION_PROJECT_CREATE: ElectrificationProject = {
  electrificationProjectId: '5183f223-526a-44cf-8b6a-80f90c4e802b',
  activityId: 'ACTI1234',
  submittedAt: new Date(),
  projectName: null,
  projectDescription: null,
  companyIdRegistered: null,
  companyNameRegistered: null,
  projectType: null,
  bcHydroNumber: null,
  submissionType: SubmissionType.GUIDANCE,
  intakeStatus: IntakeStatus.SUBMITTED,
  applicationStatus: ApplicationStatus.NEW,
  aaiUpdated: false,
  addedToAts: false,
  projectCategory: null,
  locationDescription: null,
  hasEpa: null,
  megawatts: null,
  bcEnvironmentAssessNeeded: null,
  assignedUserId: null,
  astNotes: null,
  queuePriority: null,
  atsClientId: null,
  atsEnquiryId: null,
  createdBy: '811896a0-e1fe-4c38-8cd3-86245c79e8f8',
  createdAt: new Date(),
  updatedBy: null,
  updatedAt: null,
  deletedBy: null,
  deletedAt: null
};

export const TEST_EMAIL: Email = {
  to: ['nav@example.com'],
  from: 'noreply@example.com',
  cc: ['noreply@example.com'],
  subject: 'Updates for project ACTI1234, Test Permit',
  bodyType: 'html',
  body: '<html>email body</html>'
};

export const TEST_EMAIL_RESPONSE = {
  data: {
    messages: [
      {
        msgId: '212112221',
        tag: 'tag',
        to: ['abc@abc.com']
      }
    ],
    txId: 'txid12345'
  },
  status: 201
};

export const TEST_ENQUIRY_1: Enquiry = {
  enquiryId: 'ff5db6e3-3bd4-4a5c-b001-aa5ae3d72211',
  activityId: 'ACTI1234',
  addedToAts: false,
  assignedUserId: null,
  atsClientId: null,
  atsEnquiryId: null,
  submissionType: SubmissionType.GENERAL_ENQUIRY,
  submittedAt: new Date(),
  submittedBy: 'testuser',
  relatedActivityId: 'ACTI1234',
  enquiryDescription: 'Test enquiry description',
  submittedMethod: EnquirySubmittedMethod.PHONE,
  intakeStatus: IntakeStatus.SUBMITTED,
  enquiryStatus: ApplicationStatus.IN_PROGRESS,
  waitingOn: null,
  createdAt: null,
  createdBy: null,
  updatedAt: null,
  updatedBy: null,
  deletedBy: null,
  deletedAt: null,
  activity: {
    activityId: 'ACTI1234',
    initiativeId: Initiative.HOUSING,
    createdAt: null,
    createdBy: null,
    updatedAt: null,
    updatedBy: null,
    deletedBy: null,
    deletedAt: null,
    activityContact: [
      {
        activityId: 'ACTI1234',
        contactId: TEST_CONTACT_1.contactId,
        role: ActivityContactRole.PRIMARY,
        createdAt: null,
        createdBy: null,
        updatedAt: null,
        updatedBy: null,
        deletedBy: null,
        deletedAt: null
      }
    ]
  },

  user: null
};

export const TEST_ENQUIRY_INTAKE: EnquiryIntake = {
  contact: TEST_CONTACT_1,
  basic: {
    submissionType: SubmissionType.GENERAL_ENQUIRY,
    relatedActivityId: 'ACTI1234',
    enquiryDescription: 'Test enquiry description'
  }
};

export const TEST_HOUSING_DRAFT: Draft = {
  draftId: '0a339ab8-4a87-42d9-8d83-5f169de4a102',
  activityId: 'ACTI1234',
  data: {} as Prisma.JsonValue,
  draftCode: DraftCode.HOUSING_PROJECT,
  createdAt: null,
  createdBy: null,
  updatedAt: null,
  updatedBy: null,
  deletedBy: null,
  deletedAt: null
};

export const TEST_HOUSING_PROJECT_1: HousingProject = {
  housingProjectId: '5183f223-526a-44cf-8b6a-80f90c4e802b',
  activityId: 'ACTI1234',
  assignedUserId: null,
  submittedAt: new Date(),
  submittedBy: 'Doe, John',
  locationPids: null,
  companyIdRegistered: 'FM0281610',
  companyNameRegistered: 'COMPANY',
  projectName: 'NAME',
  projectDescription: 'DESCRIPTION',
  singleFamilyUnits: NumResidentialUnits.ONE_TO_NINE,
  streetAddress: '123 Street',
  latitude: null,
  longitude: null,
  queuePriority: 3,
  relatedPermits: null,
  astNotes: null,
  astUpdated: false,
  addedToAts: false,
  atsClientId: null,
  ltsaCompleted: false,
  bcOnlineCompleted: false,
  naturalDisaster: false,
  financiallySupported: false,
  financiallySupportedBc: BasicResponse.NO,
  financiallySupportedIndigenous: BasicResponse.NO,
  financiallySupportedNonProfit: BasicResponse.NO,
  financiallySupportedHousingCoop: BasicResponse.NO,
  aaiUpdated: false,
  waitingOn: null,
  intakeStatus: IntakeStatus.SUBMITTED,
  applicationStatus: ApplicationStatus.NEW,
  atsEnquiryId: null,
  checkProvincialPermits: null,
  consentToFeedback: false,
  geoJson: null,
  geomarkUrl: null,
  hasAppliedProvincialPermits: null,
  hasRentalUnits: BasicResponse.NO,
  housingCoopDescription: null,
  indigenousDescription: null,
  isDevelopedInBc: BasicResponse.YES,
  locality: 'Place',
  multiFamilyUnits: BasicResponse.NO,
  nonProfitDescription: null,
  otherUnits: BasicResponse.NO,
  otherUnitsDescription: null,
  projectApplicantType: null,
  projectLocation: 'Location',
  projectLocationDescription: 'Location description',
  province: 'AA',
  rentalUnits: BasicResponse.NO,
  submissionType: SubmissionType.GUIDANCE,
  createdAt: null,
  createdBy: null,
  updatedBy: null,
  updatedAt: null,
  deletedBy: null,
  deletedAt: null
};

export const TEST_HOUSING_PROJECT_CREATE: HousingProject = {
  housingProjectId: '5183f223-526a-44cf-8b6a-80f90c4e802b',
  activityId: 'ACTI1234',
  assignedUserId: null,
  submittedAt: new Date(),
  submittedBy: 'Doe, John',
  locationPids: null,
  companyIdRegistered: 'FM0281610',
  companyNameRegistered: 'COMPANY',
  projectName: 'NAME',
  projectDescription: 'DESCRIPTION',
  singleFamilyUnits: NumResidentialUnits.ONE_TO_NINE,
  streetAddress: '123 Street',
  latitude: null,
  longitude: null,
  queuePriority: 3,
  relatedPermits: null,
  astNotes: null,
  astUpdated: false,
  addedToAts: false,
  atsClientId: null,
  ltsaCompleted: false,
  bcOnlineCompleted: false,
  naturalDisaster: false,
  financiallySupported: false,
  financiallySupportedBc: BasicResponse.NO,
  financiallySupportedIndigenous: BasicResponse.NO,
  financiallySupportedNonProfit: BasicResponse.NO,
  financiallySupportedHousingCoop: BasicResponse.NO,
  aaiUpdated: false,
  waitingOn: null,
  intakeStatus: IntakeStatus.SUBMITTED,
  applicationStatus: ApplicationStatus.NEW,
  atsEnquiryId: null,
  checkProvincialPermits: null,
  consentToFeedback: false,
  geoJson: null,
  geomarkUrl: null,
  hasAppliedProvincialPermits: null,
  hasRentalUnits: BasicResponse.NO,
  housingCoopDescription: null,
  indigenousDescription: null,
  isDevelopedInBc: BasicResponse.YES,
  locality: 'Place',
  multiFamilyUnits: BasicResponse.NO,
  nonProfitDescription: null,
  otherUnits: BasicResponse.NO,
  otherUnitsDescription: null,
  projectApplicantType: null,
  projectLocation: 'Location',
  projectLocationDescription: 'Location description',
  province: 'AA',
  rentalUnits: BasicResponse.NO,
  submissionType: SubmissionType.GUIDANCE,
  createdBy: '811896a0-e1fe-4c38-8cd3-86245c79e8f8',
  createdAt: new Date(),
  updatedBy: null,
  updatedAt: null,
  deletedBy: null,
  deletedAt: null
};

export const TEST_HOUSING_PROJECT_INTAKE: HousingProjectIntake = {
  activityId: null,
  submittedAt: new Date().toISOString(),
  applicationStatus: ApplicationStatus.NEW,
  appliedPermits: [],
  basic: {
    consentToFeedback: false,
    isDevelopedInBc: BasicResponse.YES,
    projectApplicantType: null,
    registeredId: 'FM0281610',
    registeredName: 'COMPANY'
  },
  contact: TEST_CONTACT_1,
  draftId: '0a339ab8-4a87-42d9-8d83-5f169de4a102',
  housing: {
    financiallySupportedBc: BasicResponse.NO,
    financiallySupportedIndigenous: BasicResponse.NO,
    financiallySupportedNonProfit: BasicResponse.NO,
    financiallySupportedHousingCoop: BasicResponse.NO,
    hasRentalUnits: BasicResponse.NO,
    multiFamilyUnits: BasicResponse.NO,
    otherUnits: BasicResponse.NO,
    projectName: 'NAME',
    projectDescription: 'DESCRIPTION',
    housingCoopDescription: null,
    indigenousDescription: null,
    nonProfitDescription: null,
    otherUnitsDescription: null,
    rentalUnits: BasicResponse.NO,
    singleFamilyUnits: NumResidentialUnits.ONE_TO_NINE
  },
  investigatePermits: [],
  location: {
    geoJson: null,
    naturalDisaster: BasicResponse.NO,
    geomarkUrl: null,
    latitude: null,
    longitude: null,
    locality: 'Place',
    ltsaPidLookup: null,
    projectLocation: 'Location',
    projectLocationDescription: 'Location description',
    province: 'AA',
    streetAddress: '123 Street'
  },
  submissionType: SubmissionType.GUIDANCE,
  permits: {
    hasAppliedProvincialPermits: null
  }
};

export const TEST_INITIATIVE_ELECTRIFICATION: InitiativeModel = {
  initiativeId: 'initiative123',
  code: Initiative.ELECTRIFICATION,
  label: '',
  createdAt: null,
  createdBy: null,
  updatedAt: null,
  updatedBy: null,
  deletedBy: null,
  deletedAt: null
};

export const TEST_INITIATIVE_HOUSING: InitiativeModel = {
  initiativeId: 'initiative123',
  code: Initiative.HOUSING,
  label: '',
  createdAt: null,
  createdBy: null,
  updatedAt: null,
  updatedBy: null,
  deletedBy: null,
  deletedAt: null
};

export const TEST_NOTE_1: Note = {
  noteId: 'bf010d64-529b-4dec-945b-47109f8bbdc8',
  noteHistoryId: 'd9bc3e53-2aad-4160-903f-e62e31e0efd1',
  note: 'Some text',
  createdAt: null,
  createdBy: null,
  updatedBy: null,
  updatedAt: null,
  deletedBy: null,
  deletedAt: null
};

export const TEST_NOTE_HISTORY_1: NoteHistory = {
  noteHistoryId: 'd9bc3e53-2aad-4160-903f-e62e31e0efd1',
  activityId: 'ACTI1234',
  bringForwardDate: null,
  bringForwardState: null,
  escalateToSupervisor: false,
  escalateToDirector: false,
  escalationType: null,
  shownToProponent: false,
  title: 'Title',
  type: NoteType.GENERAL,
  createdAt: null,
  createdBy: null,
  updatedBy: null,
  updatedAt: null,
  deletedBy: null,
  deletedAt: null
};

export const TEST_NOTE_HISTORY_2: NoteHistory = {
  noteHistoryId: 'b5fc6e2a-e03f-459e-ae09-5f359a175db6',
  activityId: 'ACTI1234',
  bringForwardDate: null,
  bringForwardState: null,
  escalateToSupervisor: false,
  escalateToDirector: false,
  escalationType: null,
  shownToProponent: true,
  title: 'Title 2',
  type: NoteType.GENERAL,
  createdAt: null,
  createdBy: null,
  updatedBy: null,
  updatedAt: null,
  deletedBy: null,
  deletedAt: null
};

export const TEST_PEACH_RECORD_1: PeachRecord = {
  transaction_id: '11111111-1111-4111-8111-111111111111',
  version: '0.1.0',
  kind: 'Record',
  record_kind: 'Permit',
  system_id: PeachIntegratedSystem.VFCBC,
  record_id: 'REC-SUB',
  process_event_set: [
    {
      event: { start_date: '2024-02-01' },
      process: {
        code: 'SUBMITTED',
        code_display: 'Submitted',
        code_set: ['APPLICATION', 'PRE_APPLICATION', 'SUBMITTED'],
        code_system: 'https://bcgov.github.io/nr-pies/docs/spec/code_system/application_process'
      }
    }
  ],
  on_hold_event_set: []
};

export const TEST_PEACH_RECORD_2: PeachRecord = {
  transaction_id: '22222222-2222-4222-8222-222222222222',
  version: '0.1.0',
  kind: 'Record',
  record_kind: 'Permit',
  system_id: PeachIntegratedSystem.VFCBC,
  record_id: 'REC-DECISION',
  process_event_set: [
    {
      event: { start_datetime: '2024-03-01T12:00:00.000Z' },
      process: {
        code: 'ALLOWED',
        code_display: 'Allowed',
        code_set: ['APPLICATION', 'DECISION', 'ALLOWED'],
        code_system: 'https://bcgov.github.io/nr-pies/docs/spec/code_system/application_process'
      }
    }
  ],
  on_hold_event_set: []
};

export const TEST_PEACH_RECORD_ISSUED: PeachRecord = {
  transaction_id: '55555555-5555-4555-8555-555555555555',
  version: '0.1.0',
  kind: 'Record',
  record_kind: 'Permit',
  system_id: PeachIntegratedSystem.VFCBC,
  record_id: 'REC-ISSUED',
  process_event_set: [
    {
      // NOTE: start_date only (no start_datetime) so we hit
      // the piesEventToDate "else" branch.
      event: { start_date: '2024-07-01' },
      process: {
        code: 'ISSUED',
        code_display: 'Issued',
        code_set: ['APPLICATION', 'ISSUANCE', 'ISSUED'],
        code_system: 'https://bcgov.github.io/nr-pies/docs/spec/code_system/application_process'
      }
    }
  ],
  on_hold_event_set: []
};

export const TEST_PEACH_RECORD_REJECTED: PeachRecord = {
  transaction_id: '33333333-3333-4333-8333-333333333333',
  version: '0.1.0',
  kind: 'Record',
  record_kind: 'Permit',
  system_id: PeachIntegratedSystem.VFCBC,
  record_id: 'REC-REJECTED',
  process_event_set: [
    {
      event: { start_date: '2024-04-01' },
      process: {
        code: 'TECH_REVIEW_COMMENT',
        code_display: 'Technical Review',
        code_set: ['APPLICATION', 'TECH_REVIEW_COMMENT', 'TECHNICAL_REVIEW'],
        code_system: 'https://bcgov.github.io/nr-pies/docs/spec/code_system/application_process'
      }
    },
    {
      event: { start_datetime: '2024-05-01T23:12:00.000Z' },
      process: {
        code: 'REJECTED',
        code_display: 'Rejected',
        code_set: ['APPLICATION', 'REJECTED'],
        code_system: 'https://bcgov.github.io/nr-pies/docs/spec/code_system/application_process'
      }
    }
  ],
  on_hold_event_set: []
};

export const TEST_PEACH_RECORD_UNMAPPED: PeachRecord = {
  transaction_id: '44444444-4444-4444-8444-444444444444',
  version: '0.1.0',
  kind: 'Record',
  record_kind: 'Permit',
  system_id: PeachIntegratedSystem.VFCBC,
  record_id: 'REC-UNMAPPED',
  process_event_set: [
    {
      event: { start_datetime: '2024-06-01T00:00:00.000Z' },
      process: {
        code: 'PRE_APPLICATION',
        code_display: 'Pre-Application',
        code_set: ['APPLICATION', 'PRE_APPLICATION'],
        code_system: 'https://bcgov.github.io/nr-pies/docs/spec/code_system/application_process'
      }
    },
    {
      event: { start_datetime: '2024-06-01T00:00:00.000Z' },
      process: {
        code: 'APPLICATION',
        code_display: 'Application',
        code_set: ['APPLICATION'],
        code_system: 'https://bcgov.github.io/nr-pies/docs/spec/code_system/application_process'
      }
    }
  ],
  on_hold_event_set: []
};

export const TEST_PEACH_SUMMARY: PeachSummary = {
  stage: PermitStage.APPLICATION_SUBMISSION,
  state: PermitState.IN_PROGRESS,
  submittedDate: '2024-01-10',
  decisionDate: '2024-02-01',
  statusLastChanged: '2024-01-15',
  submittedTime: null,
  decisionTime: null,
  statusLastChangedTime: null
};

export const TEST_PERMIT_1: Permit = {
  permitId: '1381438d-0c7a-46bf-8ae2-d1febbf27066',
  permitTypeId: 1,
  activityId: 'ACTI1234',
  issuedPermitId: null,
  state: PermitState.NONE,
  needed: PermitNeeded.YES,
  stage: PermitStage.PRE_SUBMISSION,
  submittedDate: null,
  submittedTime: null,
  decisionDate: null,
  decisionTime: null,
  statusLastChanged: null,
  statusLastChangedTime: null,
  statusLastVerified: null,
  statusLastVerifiedTime: null,
  createdAt: null,
  createdBy: null,
  updatedAt: null,
  updatedBy: null,
  deletedBy: null,
  deletedAt: null,
  permitTracking: [
    {
      createdBy: null,
      createdAt: null,
      updatedBy: null,
      updatedAt: null,
      deletedBy: null,
      deletedAt: null,
      shownToProponent: true,
      permitId: '1381438d-0c7a-46bf-8ae2-d1febbf27066',
      permitTrackingId: 1,
      trackingId: 'REC-SUB',
      sourceSystemKindId: 1,
      sourceSystemKind: {
        createdBy: null,
        createdAt: null,
        updatedBy: null,
        updatedAt: null,
        deletedBy: null,
        deletedAt: null,
        sourceSystemKindId: 12,
        sourceSystem: PeachIntegratedSystem.VFCBC,
        integrated: true,
        kind: null,
        description: 'Tracking Number'
      }
    }
  ]
};

export const TEST_PERMIT_2: Permit = {
  permitId: 'fac00e1e-a68e-4fe0-a7bf-43ed3896c751',
  permitTypeId: 1,
  activityId: 'ACTI1234',
  issuedPermitId: null,
  state: PermitState.IN_PROGRESS,
  needed: PermitNeeded.YES,
  stage: PermitStage.APPLICATION_SUBMISSION,
  submittedDate: '2024-01-05',
  submittedTime: null,
  decisionDate: null,
  decisionTime: null,
  statusLastChangedTime: null,
  statusLastVerifiedTime: null,
  statusLastChanged: '2024-01-05',
  statusLastVerified: '2024-01-05',
  createdAt: null,
  createdBy: null,
  updatedAt: null,
  updatedBy: null,
  deletedBy: null,
  deletedAt: null,
  permitTracking: [
    {
      createdBy: null,
      createdAt: null,
      updatedBy: null,
      updatedAt: null,
      deletedBy: null,
      deletedAt: null,
      shownToProponent: true,
      permitId: 'fac00e1e-a68e-4fe0-a7bf-43ed3896c751',
      permitTrackingId: 2,
      trackingId: 'REC-XYZ',
      sourceSystemKindId: 2,
      sourceSystemKind: {
        createdBy: null,
        createdAt: null,
        updatedBy: null,
        updatedAt: null,
        deletedBy: null,
        deletedAt: null,
        sourceSystemKindId: 12,
        sourceSystem: PeachIntegratedSystem.VFCBC,
        integrated: true,
        kind: null,
        description: 'Tracking Number'
      }
    }
  ]
};

export const TEST_PERMIT_3: Permit = {
  permitId: '7530538d-4671-47fe-9b3f-31d70b6b72dc',
  permitTypeId: 1,
  activityId: 'ACTI1234',
  issuedPermitId: null,
  state: PermitState.NONE,
  needed: PermitNeeded.UNDER_INVESTIGATION,
  stage: PermitStage.PRE_SUBMISSION,
  submittedDate: null,
  submittedTime: null,
  decisionDate: null,
  decisionTime: null,
  statusLastChanged: null,
  statusLastChangedTime: null,
  statusLastVerified: null,
  statusLastVerifiedTime: null,
  createdAt: null,
  createdBy: null,
  updatedAt: null,
  updatedBy: null,
  deletedBy: null,
  deletedAt: null,
  permitTracking: [
    {
      createdBy: null,
      createdAt: null,
      updatedBy: null,
      updatedAt: null,
      deletedBy: null,
      deletedAt: null,
      shownToProponent: true,
      permitId: '7530538d-4671-47fe-9b3f-31d70b6b72dc',
      permitTrackingId: 3,
      trackingId: 'REC-999',
      sourceSystemKindId: 3,
      sourceSystemKind: {
        createdBy: null,
        createdAt: null,
        updatedBy: null,
        updatedAt: null,
        deletedBy: null,
        deletedAt: null,
        sourceSystemKindId: 22,
        sourceSystem: 'ITSM-5644', // FTA
        integrated: false,
        kind: null,
        description: 'Project Number'
      }
    }
  ]
};

export const TEST_PERMIT_4: Permit = {
  permitId: '11111111-2222-3333-4444-555555555555',
  permitTypeId: 1,
  activityId: 'ACTI1234',
  issuedPermitId: null,
  state: PermitState.NONE,
  needed: PermitNeeded.YES,
  stage: PermitStage.PRE_SUBMISSION,
  submittedDate: null,
  submittedTime: null,
  decisionDate: null,
  decisionTime: null,
  statusLastChanged: null,
  statusLastChangedTime: null,
  statusLastVerified: null,
  statusLastVerifiedTime: null,
  createdAt: null,
  createdBy: null,
  updatedAt: null,
  updatedBy: null,
  deletedBy: null,
  deletedAt: null,
  permitTracking: []
};

export const TEST_PERMIT_LIST: Permit[] = [TEST_PERMIT_1];

export const TEST_PERMIT_NOTE_1: PermitNote = {
  permitNoteId: 'a752026b-2899-4603-b56b-aa3c9b53ed20',
  permitId: '1381438d-0c7a-46bf-8ae2-d1febbf27066',
  note: 'This is a permit note',
  createdAt: null,
  createdBy: null,
  updatedAt: null,
  updatedBy: null,
  deletedBy: null,
  deletedAt: null
};

export const TEST_PERMIT_NOTE_UPDATE: PermitNote = {
  ...TEST_PERMIT_NOTE_1,
  note: `This application is ${TEST_PERMIT_1.state.toLocaleLowerCase()} in the ${TEST_PERMIT_1.stage.toLocaleLowerCase()}.` // eslint-disable-line max-len
};

export const TEST_PERMIT_TYPE_1: PermitType = {
  permitTypeId: 1,
  agency: 'SOME_AGENCY',
  division: 'SOME_DIVISION',
  branch: 'SOME_BRANCH',
  businessDomain: 'DOMAIN',
  type: 'ABC',
  family: null,
  name: 'PERMIT1',
  nameSubtype: null,
  acronym: 'PRT1',
  infoUrl: 'https://example.com/permit1',
  trackedInAts: true,
  sourceSystem: 'CODE',
  createdAt: null,
  createdBy: null,
  updatedAt: null,
  updatedBy: null,
  deletedBy: null,
  deletedAt: null
};

export const TEST_PERMIT_TYPE_LIST: PermitType[] = [TEST_PERMIT_TYPE_1];

export const TEST_IDIR_USER_1: User = {
  bceidBusinessName: null,
  userId: '5e3f0c19-8664-4a43-ac9e-210da336e923',
  idp: IdentityProvider.IDIR,
  sub: 'cd90c6bf44074872a7116f4dd4f3a45b@idir',
  email: 'John.Doe@example.com',
  firstName: 'John',
  fullName: 'Doe, John',
  lastName: 'Doe',
  active: true,
  createdAt: null,
  createdBy: null,
  updatedAt: null,
  updatedBy: null,
  deletedBy: null,
  deletedAt: null
};
