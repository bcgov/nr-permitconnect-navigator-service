import type { GeoJSON } from 'geojson';

import type { UUID } from '../common';
import type { MaybeUndefined, Nullable } from '../util';
import type { AccessRequestStatus, BasicResponse, GroupName, IdentityProviderKind } from '@/utils/enums/application';
import type { BusinessArea, PermitStage, PermitState, PiesOnHold } from '@/utils/enums/codeEnums';
import type { NumResidentialUnits } from '@/utils/enums/housing';
import type {
  ActivityContactRole,
  ApplicationStatus,
  Area,
  ContactPreference,
  EnquirySubmittedMethod,
  NoteType,
  ProjectApplicant,
  ProjectRelationship,
  Region,
  SubmissionType
} from '@/utils/enums/projectCommon';

/**
 * Shared interfaces
 */
export interface AuditFields {
  createdBy?: Nullable<string>;
  createdAt?: Nullable<string>;
  updatedBy?: Nullable<string>;
  updatedAt?: Nullable<string>;
  deletedBy?: Nullable<string>;
  deletedAt?: Nullable<string>;
}

export interface ProjectBase extends AuditFields {
  projectId: string;
  activityId: string;
  submittedAt: string;
  assignedUserId?: string | null;
  applicationStatus: ApplicationStatus;

  companyIdRegistered?: string | null;
  companyNameRegistered?: string | null;
  hasRelatedEnquiry: boolean;
  queuePriority: number;
  submissionType: SubmissionType;
  projectName: string;
  projectDescription: string;
  multiPermitsNeeded: string;
  relatedEnquiries?: string;
  astNotes?: string | null;
  atsClientId: number | null;
  atsEnquiryId: number | null;
  addedToAts: boolean;
  aaiUpdated: boolean;
}

interface ProjectRelations {
  activity: Activity;
  contacts: Contact[];
  user: User;
}

/**
 * Access Request
 */

export interface AccessRequestBase extends AuditFields {
  accessRequestId: UUID;
  userId: UUID;
  grant: boolean;
  groupId: number;
  status: AccessRequestStatus;
}

interface AccessRequestRelations {
  group: Group;
}

export type AccessRequest = AccessRequestBase & Partial<AccessRequestRelations>;

/**
 * Activity
 */

export interface Activity extends AuditFields {
  activityId: string;
  initiativeId: UUID;

  // Joined
  activityContact?: ActivityContact[];
}

/**
 * Activity Contact
 */

export interface ActivityContactBase extends AuditFields {
  activityId: string;
  contactId: UUID;
  role: ActivityContactRole;
}

interface ActivityContactRelations {
  contact: Contact;
}

export type ActivityContact = ActivityContactBase & Partial<ActivityContactRelations>;

/**
 * Bring Forward
 */

export interface BringForward {
  activityId: string;
  enquiryId?: string;
  noteId: string;
  electrificationProjectId?: string;
  escalateToDirector?: boolean;
  escalateToSupervisor?: boolean;
  generalProjectId?: string;
  housingProjectId?: string;
  title: string;
  projectName?: string;
  bringForwardDate: string;
  createdByFullName?: string;
}

/**
 * Contact
 */

export interface ContactBase extends AuditFields {
  contactId: UUID;
  userId?: UUID;
  bceidBusinessName?: string;
  contactApplicantRelationship?: ProjectRelationship;
  contactPreference?: ContactPreference;
  email: string;
  firstName: string;
  lastName?: string;
  phoneNumber?: string;
}

interface ContactRelations {
  activityContact?: ActivityContact[];
}

export type Contact = ContactBase & Partial<ContactRelations>;

/**
 * Document
 */

export interface Document extends AuditFields {
  documentId: UUID;
  activityId: string;
  filename: string;
  extension?: MaybeUndefined<string>;
  mimeType: string;
  filesize: number;
  createdByFullName: string;
}

/**
 * Draft
 */

export interface Draft<T> extends AuditFields {
  draftId: UUID;
  activityId: string;
  draftCode: string;
  data: T;
}

/**
 * Electrification Project
 */

export interface ElectrificationProjectBase extends ProjectBase {
  electrificationProjectId: UUID;
  projectType?: string;
  projectCategory?: Nullable<string>;
  bcHydroNumber?: Nullable<string>;
  locationDescription?: Nullable<string>;
  hasEpa?: Nullable<string>;
  megawatts?: Nullable<number>;
  bcEnvironmentAssessNeeded?: Nullable<string>;
}

export type ElectrificationProject = ElectrificationProjectBase & Partial<ProjectRelations>;

/**
 * Enquiry
 */

export interface EnquiryBase extends AuditFields {
  enquiryId: UUID;
  activityId: string;
  addedToAts: boolean;
  assignedUserId?: Nullable<string>;
  atsClientId: Nullable<number>;
  atsEnquiryId: Nullable<number>;
  submissionType: SubmissionType;
  submittedAt: string;
  submittedBy: string;
  relatedActivityId?: Nullable<string>;
  enquiryDescription?: string;
  enquiryStatus: ApplicationStatus;
  submittedMethod: EnquirySubmittedMethod;
}

interface EnquiryRelations {
  activity: Activity;
  contact: Contact;
}

export type Enquiry = EnquiryBase & Partial<EnquiryRelations>;

/**
 * General Project
 */

export interface GeneralProjectBase extends ProjectBase {
  generalProjectId: UUID;
  projectNumber?: string;
  projectApplicantType: ProjectApplicant;
  geoJson?: GeoJSON;
  projectLocation: string;
  projectLocationDescription?: Nullable<string>;
  locality?: Nullable<string>;
  province?: Nullable<string>;
  locationPids?: Nullable<string>;
  latitude?: Nullable<number>;
  longitude?: Nullable<number>;
  streetAddress?: Nullable<string>;
  geomarkUrl?: Nullable<string>;
  naturalDisaster: boolean;
  hasAppliedProvincialPermits: boolean;
  activityType: string;
  region?: Nullable<Region>;
  area?: Nullable<Area>;
  businessArea?: Nullable<BusinessArea>;
}

export type GeneralProject = GeneralProjectBase & Partial<ProjectRelations>;

/**
 * Group
 */

export interface Group {
  groupId: number;
  initiativeCode?: string;
  initiativeId: string;
  name: GroupName;
  label?: string;
}

/**
 * Housing Project
 */

export interface HousingProjectBase extends ProjectBase {
  housingProjectId: UUID;
  projectApplicantType: ProjectApplicant;
  consentToFeedback?: boolean;
  geoJson?: GeoJSON;
  projectLocation: string;
  projectLocationDescription?: Nullable<string>;
  singleFamilyUnits?: Nullable<NumResidentialUnits>;
  multiFamilyUnits?: Nullable<NumResidentialUnits>;
  otherUnitsDescription?: Nullable<string>;
  otherUnits?: Nullable<NumResidentialUnits>;
  hasRentalUnits: BasicResponse;
  rentalUnits: string;
  financiallySupportedBc: BasicResponse;
  financiallySupportedIndigenous: BasicResponse;
  indigenousDescription: string;
  financiallySupportedNonProfit: BasicResponse;
  nonProfitDescription: string;
  financiallySupportedHousingCoop: BasicResponse;
  housingCoopDescription: string;
  locality?: Nullable<string>;
  province?: Nullable<string>;
  locationPids?: Nullable<string>;
  latitude?: Nullable<number>;
  longitude?: Nullable<number>;
  streetAddress?: Nullable<string>;
  geomarkUrl?: Nullable<string>;
  naturalDisaster: boolean;
  ltsaCompleted: boolean;
  bcOnlineCompleted: boolean;
  hasAppliedProvincialPermits: boolean;
}

export type HousingProject = HousingProjectBase & Partial<ProjectRelations>;

/**
 * Identity Provider
 */

export interface IdentityProvider extends AuditFields {
  idp: string;
  kind: IdentityProviderKind;
  username: string;
}

/**
 * Initiative
 */

export interface Initiative extends AuditFields {
  initiativeId: UUID;
  code: string;
  label: string;
}

/**
 * Note
 */

export interface Note extends AuditFields {
  noteId?: UUID;
  noteHistoryId?: UUID;
  note: string;
}

/**
 * Note History
 */

export interface NoteHistoryBase extends AuditFields {
  noteHistoryId: UUID;
  activityId: string;
  bringForwardDate: Nullable<string>;
  bringForwardState: Nullable<string>;
  escalateToDirector: boolean;
  escalateToSupervisor: boolean;
  escalationType: Nullable<string>;
  shownToProponent: boolean;
  title: string;
  type: NoteType;
}

interface NoteHistoryRelations {
  note: Note[];
}

export type NoteHistory = NoteHistoryBase & Partial<NoteHistoryRelations>;

/**
 * Permit
 */

interface PermitBase extends AuditFields {
  permitId: UUID;
  activityId: string;
  issuedPermitId?: Nullable<string>;
  needed: string;
  permitTypeId: number;
  stage: PermitStage;
  state: PermitState;
  submittedDate?: Nullable<string>;
  submittedTime?: Nullable<string>;
  statusLastChanged?: Nullable<string>;
  statusLastChangedTime?: Nullable<string>;
  statusLastVerified?: Nullable<string>;
  statusLastVerifiedTime?: Nullable<string>;
  targetDate?: Nullable<string>;
  targetDateDescription?: Nullable<string>;
  decisionDate?: Nullable<string>;
  decisionTime?: Nullable<string>;
  onHoldCode?: Nullable<PiesOnHold>;
}

interface PermitRelations {
  permitNote: PermitNote[];
  permitTracking: PermitTracking[];
  permitType: PermitType;
}

export type Permit = PermitBase & Partial<PermitRelations>;

/**
 * Permit Note
 */

export interface PermitNote extends AuditFields {
  permitNoteId: UUID;
  permitId: UUID;
  note: string;
}

/**
 * Permit Tracking
 */

export interface PermitTracking extends AuditFields {
  permitTrackingId?: UUID;
  permitId?: UUID;
  shownToProponent: boolean;
  sourceSystemKind?: SourceSystemKind;
  sourceSystemKindId?: number;
  trackingId?: string;
}

/**
 * Permit Type
 */

export interface PermitTypeBase extends AuditFields {
  permitTypeId: number;
  agency: string;
  branch: string;
  businessDomain: string;
  division: string;
  family?: string;
  infoUrl?: string;
  name: string;
  nameSubtype?: string;
  acronym?: string;
  trackedInAts?: boolean;
  sourceSystem: string;
  sourceSystemAcronym: string;
  trackedInATS?: boolean;
  type: string;
}

interface PermitTypeRelations {
  permitTypeInitiativeXref: {
    permitTypeId: number;
    initiativeId: UUID;
    initiative: Initiative;
  }[];
}

export type PermitType = PermitTypeBase & Partial<PermitTypeRelations>;

/**
 * Source System Kind
 */

export interface SourceSystemKind extends AuditFields {
  sourceSystemKindId: number;
  description: string;
  integrated: boolean;
  kind?: string;
  permitTypeIds: number[];
  sourceSystem: string;
}

/**
 * User
 */

export interface User extends AuditFields {
  active: boolean;
  email: string;
  firstName: string;
  fullName: string;
  idp: string;
  lastName: string;
  groups: Group[];
  status?: string;
  userId: UUID;
  sub: string;
  elevatedRights: boolean;
  bceidBusinessName: string;
}
