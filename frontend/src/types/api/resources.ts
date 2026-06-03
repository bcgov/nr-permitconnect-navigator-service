import type { GeoJSON } from 'geojson';

import type { MaybeUndefined, Nullable, UUID } from '../util';
import type { AccessRequestStatus, BasicResponse, IdentityProviderKind } from '@/utils/enums/application';
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
import type { BusinessArea, PermitStage, PermitState, PiesOnHold } from '@/utils/enums/codeEnums';
import type { Group } from './responses';

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

interface Project extends AuditFields {
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
  astNotes?: string | null;
  atsClientId: number | null;
  atsEnquiryId: number | null;
  addedToAts: boolean;
  aaiUpdated: boolean;

  activity?: Activity;
  contacts: Contact[];
  user?: User;
}

/**
 * Access Request
 */

export interface AccessRequest extends AuditFields {
  accessRequestId?: UUID;
  grant?: boolean;
  groupId: number;
  groupLabel?: string;
  status: AccessRequestStatus;
  userId?: UUID;
  update?: boolean;
}

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

export interface ActivityContact extends AuditFields {
  activityId: string;
  contactId: UUID;
  role: ActivityContactRole;

  // Joined
  contact?: Contact;
}

/**
 * Contact
 */

interface ContactBase {
  bceidBusinessName?: string;
  contactApplicantRelationship?: ProjectRelationship;
  contactPreference?: ContactPreference;
  email: string;
  firstName: string;
  lastName?: string;
  phoneNumber?: string;
}

export interface Contact extends ContactBase, AuditFields {
  contactId: UUID;
  userId?: UUID;
  activityContact?: ActivityContact[];
}

export type CreateContactDto = ContactBase;

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

export interface ElectrificationProject extends Project {
  electrificationProjectId: UUID;
  projectType?: string;
  projectCategory?: Nullable<string>;
  bcHydroNumber?: Nullable<string>;
  locationDescription?: Nullable<string>;
  hasEpa?: Nullable<string>;
  megawatts?: Nullable<number>;
  bcEnvironmentAssessNeeded?: Nullable<string>;
}

/**
 * Enquiry
 */

interface EnquiryBase extends AuditFields {
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

export interface Enquiry extends EnquiryBase {
  activity?: Activity;
  activityId: string;
  enquiryId: UUID;
}

export interface EnquiryArgs extends Partial<EnquiryBase> {
  contact: Contact;
}

/**
 * General Project
 */

export interface GeneralProject extends Project {
  generalProjectId: UUID;
  projectNumber?: string;
  relatedEnquiries: string;
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

/**
 * Housing Project
 */

export interface HousingProject extends Project {
  housingProjectId: UUID;
  relatedEnquiries: string;
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

/**
 * Identity Provider
 */

export interface IdentityProvider extends AuditFields {
  idp: string;
  kind: IdentityProviderKind;
  username: string;
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

export interface NoteHistory extends AuditFields {
  noteHistoryId?: UUID;
  activityId: string;
  bringForwardDate: Nullable<string>;
  bringForwardState: Nullable<string>;
  escalateToDirector: boolean;
  escalateToSupervisor: boolean;
  escalationType: Nullable<string>;
  note: Note[];
  shownToProponent: boolean;
  title: string;
  type: NoteType;
}

/**
 * Permit
 */

interface PermitBase extends AuditFields {
  activityId: string;
  issuedPermitId?: Nullable<string>;
  needed: string;
  permitNote?: PermitNote[];
  permitTracking?: PermitTracking[];
  permitType?: PermitType;
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

export interface Permit extends PermitBase {
  permitId: UUID;
}

export interface PermitArgs extends PermitBase {
  permitId?: UUID;
}

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

export interface PermitType extends AuditFields {
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
