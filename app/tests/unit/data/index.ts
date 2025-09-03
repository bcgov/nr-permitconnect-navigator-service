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
  Enquiry,
  EnquiryIntake,
  HousingProject,
  HousingProjectIntake,
  Note,
  NoteHistory,
  Permit,
  PermitNote,
  PermitType,
  User
} from '../../../src/types';
import { AuthType, BasicResponse, IdentityProvider, Initiative } from '../../../src/utils/enums/application';
import { ProjectType } from '../../../src/utils/enums/electrification';
import { PermitAuthorizationStatus, PermitNeeded, PermitStatus } from '../../../src/utils/enums/permit';
import {
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

export const TEST_CURRENT_CONTEXT: CurrentContext = {
  authType: AuthType.BEARER,
  userId: '811896a0-e1fe-4c38-8cd3-86245c79e8f8'
};

export const TEST_ELECTRIFICATION_ACTIVITY: Activity = {
  activityId: 'ACTI1234',
  initiativeId: Initiative.ELECTRIFICATION,
  isDeleted: false,
  createdAt: null,
  createdBy: null,
  updatedAt: null,
  updatedBy: null
};

export const TEST_HOUSING_ACTIVITY: Activity = {
  activityId: 'ACTI1234',
  initiativeId: Initiative.HOUSING,
  isDeleted: false,
  createdAt: null,
  createdBy: null,
  updatedAt: null,
  updatedBy: null
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
  updatedAt: null
};

export const TEST_CONTACT_NO_ID = {
  ...TEST_CONTACT_1,
  contactId: null
};

export const TEST_ELECTRIFICATION_DRAFT: Draft = {
  draftId: '0a339ab8-4a87-42d9-8d83-5f169de4a102',
  activityId: 'ACTI1234',
  data: {} as Prisma.JsonValue,
  draftCode: DraftCode.ELECTRIFICATION_PROJECT,
  createdAt: null,
  createdBy: null,
  updatedAt: null,
  updatedBy: null
};

export const TEST_ELECTRIFICATION_INTAKE: ElectrificationProjectIntake = {
  project: {
    projectName: 'NAME',
    projectDescription: 'DESCRIPTION',
    companyNameRegistered: 'COMPANY',
    projectType: ProjectType.IPP_WIND,
    bcHydroNumber: '12345',
    submissionType: SubmissionType.GUIDANCE
  },
  contacts: [TEST_CONTACT_1]
};

export const TEST_ELECTRIFICATION_PROJECT_CREATE: ElectrificationProject = {
  electrificationProjectId: '5183f223-526a-44cf-8b6a-80f90c4e802b',
  activityId: 'ACTI1234',
  submittedAt: new Date(),
  projectName: null,
  projectDescription: null,
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
  updatedAt: null
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
  updatedBy: null
};

export const TEST_ENQUIRY_INTAKE: EnquiryIntake = {
  contacts: [TEST_CONTACT_1],
  basic: {
    submissionType: SubmissionType.GENERAL_ENQUIRY,
    relatedActivityId: 'ACTI1234',
    enquiryDescription: 'Test enquiry description'
  }
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
  activity: {
    activityId: 'ACTI1234',
    initiativeId: Initiative.HOUSING,
    isDeleted: false,
    createdAt: null,
    createdBy: null,
    updatedAt: null,
    updatedBy: null,
    activityContact: [
      {
        activityId: 'ACTI1234',
        contactId: TEST_CONTACT_1.contactId,
        createdAt: null,
        createdBy: null,
        updatedAt: null,
        updatedBy: null
      }
    ]
  },

  user: null
};

export const TEST_HOUSING_DRAFT: Draft = {
  draftId: '0a339ab8-4a87-42d9-8d83-5f169de4a102',
  activityId: 'ACTI1234',
  data: {} as Prisma.JsonValue,
  draftCode: DraftCode.HOUSING_PROJECT,
  createdAt: null,
  createdBy: null,
  updatedAt: null,
  updatedBy: null
};

export const TEST_HOUSING_PROJECT_CREATE: HousingProject = {
  housingProjectId: '5183f223-526a-44cf-8b6a-80f90c4e802b',
  activityId: 'ACTI1234',
  assignedUserId: null,
  submittedAt: new Date(),
  submittedBy: 'Doe, John',
  locationPids: null,
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
  updatedAt: null
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
    registeredName: 'COMPANY'
  },
  contacts: [TEST_CONTACT_1],
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

export const TEST_HOUSING_PROJECT_1: HousingProject = {
  housingProjectId: '5183f223-526a-44cf-8b6a-80f90c4e802b',
  activityId: 'ACTI1234',
  assignedUserId: null,
  submittedAt: new Date(),
  submittedBy: 'Doe, John',
  locationPids: null,
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
  updatedAt: null
};

export const TEST_ACTIVITY_CONTACT_1: ActivityContact = {
  activityId: 'ACTI1234',
  contactId: '59b6bad3-ed3c-43f6-81f9-bbd1609d880f',
  createdAt: null,
  createdBy: null,
  updatedBy: null,
  updatedAt: null
};

export const TEST_CONTACT_WITH_ACTIVITY_1: Contact = {
  ...TEST_CONTACT_1,
  activityContact: [TEST_ACTIVITY_CONTACT_1]
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
  updatedAt: null
};

export const TEST_NOTE_1: Note = {
  noteId: 'bf010d64-529b-4dec-945b-47109f8bbdc8',
  noteHistoryId: 'd9bc3e53-2aad-4160-903f-e62e31e0efd1',
  note: 'Some text',
  createdAt: null,
  createdBy: null,
  updatedBy: null,
  updatedAt: null
};

export const TEST_NOTE_HISTORY_1: NoteHistory = {
  noteHistoryId: 'd9bc3e53-2aad-4160-903f-e62e31e0efd1',
  activityId: 'ACTI1234',
  bringForwardDate: null,
  bringForwardState: null,
  escalateToSupervisor: false,
  escalateToDirector: false,
  isDeleted: false,
  escalationType: null,
  shownToProponent: false,
  title: 'Title',
  type: NoteType.GENERAL,
  createdAt: null,
  createdBy: null,
  updatedBy: null,
  updatedAt: null
};

export const TEST_NOTE_HISTORY_2: NoteHistory = {
  noteHistoryId: 'b5fc6e2a-e03f-459e-ae09-5f359a175db6',
  activityId: 'ACTI1234',
  bringForwardDate: null,
  bringForwardState: null,
  escalateToSupervisor: false,
  escalateToDirector: false,
  isDeleted: false,
  escalationType: null,
  shownToProponent: true,
  title: 'Title 2',
  type: NoteType.GENERAL,
  createdAt: null,
  createdBy: null,
  updatedBy: null,
  updatedAt: null
};

export const TEST_PERMIT_1: Permit = {
  permitId: '1381438d-0c7a-46bf-8ae2-d1febbf27066',
  permitTypeId: 1,
  activityId: 'ACTI1234',
  issuedPermitId: null,
  authStatus: PermitAuthorizationStatus.IN_REVIEW,
  needed: PermitNeeded.YES,
  status: PermitStatus.APPLIED,
  submittedDate: new Date(),
  adjudicationDate: null,
  statusLastVerified: null,
  createdAt: null,
  createdBy: null,
  updatedAt: null,
  updatedBy: null
};

export const TEST_PERMIT_2: Permit = {
  permitId: 'fac00e1e-a68e-4fe0-a7bf-43ed3896c751',
  permitTypeId: 1,
  activityId: 'ACTI1234',
  issuedPermitId: null,
  authStatus: PermitAuthorizationStatus.IN_REVIEW,
  needed: PermitNeeded.YES,
  status: PermitStatus.APPLIED,
  submittedDate: new Date(),
  adjudicationDate: null,
  statusLastVerified: null,
  createdAt: null,
  createdBy: null,
  updatedAt: null,
  updatedBy: null
};

export const TEST_PERMIT_3: Permit = {
  permitId: '7530538d-4671-47fe-9b3f-31d70b6b72dc',
  permitTypeId: 1,
  activityId: 'ACTI1234',
  issuedPermitId: null,
  authStatus: PermitAuthorizationStatus.NONE,
  needed: PermitNeeded.UNDER_INVESTIGATION,
  status: PermitStatus.NEW,
  submittedDate: null,
  adjudicationDate: null,
  statusLastVerified: null,
  createdAt: null,
  createdBy: null,
  updatedAt: null,
  updatedBy: null
};

export const TEST_PERMIT_NOTE_1: PermitNote = {
  permitNoteId: 'a752026b-2899-4603-b56b-aa3c9b53ed20',
  permitId: '1381438d-0c7a-46bf-8ae2-d1febbf27066',
  note: 'This is a permit note',
  isDeleted: false,
  createdAt: null,
  createdBy: null,
  updatedAt: null,
  updatedBy: null
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
  updatedBy: null
};

export const TEST_PERMIT_LIST: Permit[] = [TEST_PERMIT_1];
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
  updatedBy: null
};
