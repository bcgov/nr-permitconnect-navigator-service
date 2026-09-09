// *CreateInput = Prisma.xUncheckedCreateInput. Only for repository-layer create() calls feeding Prisma
// directly - domain/service create paths use these so plain JS values (number, unknown) work without
// casting to Decimal/JsonValue. Not for read payloads (*Base) or request/service-layer types (see domain.ts).

import { Prisma } from '#prismaClient';

import type { GroupName, Initiative as InitiativeEnum } from '#src/utils/enums/application';

import type {
  access_request as AccessRequestBase,
  activity as ActivityBase,
  activity_contact as ActivityContactBase,
  business_area_code as BusinessAreaCodeBase,
  contact as ContactBase,
  document as DocumentBase,
  draft as DraftBase,
  electrification_project as ElectrificationProjectBase,
  electrification_project_category_code as ElectrificationProjectCategoryCodeBase,
  electrification_project_type_code as ElectrificationProjectTypeCodeBase,
  email_log as EmailLogBase,
  enquiry as EnquiryBase,
  escalation_type_code as EscalationTypeCodeBase,
  general_project as GeneralProjectBase,
  housing_project as HousingProjectBase,
  identity_provider as IdentityProviderBase,
  initiative as InitiativeBase,
  note as NoteBase,
  note_history as NoteHistoryBase,
  permit as PermitBasePrisma,
  permit_note as PermitNoteBase,
  permit_stage_code as PermitStageCodeBase,
  permit_state_code as PermitStateCodeBase,
  permit_tracking as PermitTrackingBase,
  permit_type as PermitTypeBase,
  permit_type_initiative_xref as PermitTypeInitiativeXrefBase,
  pies_on_hold_code as PiesOnHoldCodeBase,
  source_system_code as SourceSystemCodeBase,
  source_system_kind as SourceSystemKindBase,
  user as UserBase
} from '#prismaClient';

export type {
  AccessRequestBase,
  ActivityBase,
  ActivityContactBase,
  BusinessAreaCodeBase,
  ContactBase,
  DraftBase,
  ElectrificationProjectBase,
  ElectrificationProjectCategoryCodeBase,
  ElectrificationProjectTypeCodeBase,
  EmailLogBase,
  EnquiryBase,
  EscalationTypeCodeBase,
  GeneralProjectBase,
  HousingProjectBase,
  IdentityProviderBase,
  InitiativeBase,
  NoteBase,
  NoteHistoryBase,
  PermitNoteBase,
  PermitStageCodeBase,
  PermitStateCodeBase,
  PermitTrackingBase,
  PermitTypeBase,
  PermitTypeInitiativeXrefBase,
  PiesOnHoldCodeBase,
  SourceSystemCodeBase,
  SourceSystemKindBase,
  UserBase
};

export type AccessRequest = AccessRequestBase; // nosonar - can be removed if type is extended in future
export type AccessRequestPatch = Omit<Prisma.access_requestUpdateInput, 'accessRequestId'>;

export type Activity = ActivityBase & {
  activityContact?: ActivityContact[];
  initiative?: Initiative;
};

export type ActivityContact = ActivityContactBase & { contact?: Contact };

export type BusinessAreaCode = BusinessAreaCodeBase; // nosonar
export type Contact = ContactBase & { activityContact?: ActivityContact[]; user?: User | null };
export type ContactCreateInput = Prisma.contactUncheckedCreateInput;

export type Draft = DraftBase & { activity?: Activity };
export type DraftCreateInput = Prisma.draftUncheckedCreateInput;

export type Document = Omit<DocumentBase, 'filesize'> & { createdByFullName?: string; filesize: number };

export type ElectrificationProject = ElectrificationProjectBase & {
  activity?: Activity;
  projectId?: string;
  user?: User | null;
};
export type ElectrificationProjectCreateInput = Prisma.electrification_projectUncheckedCreateInput;

export type ElectrificationProjectCategoryCode = ElectrificationProjectCategoryCodeBase; // nosonar

export type ElectrificationProjectTypeCode = ElectrificationProjectTypeCodeBase; // nosonar

export type EmailLog = EmailLogBase; // nosonar - can be removed if type is extended in future

export type Enquiry = EnquiryBase & { activity?: Activity; user?: User | null };

export type EscalationTypeCode = EscalationTypeCodeBase; // nosonar

export type GeneralProject = GeneralProjectBase & { activity?: Activity; projectId?: string; user?: User | null };
export type GeneralProjectCreateInput = Prisma.general_projectUncheckedCreateInput;

export type HousingProject = HousingProjectBase & {
  activity?: Activity;
  projectId?: string;
  user?: User | null;
};
export type HousingProjectCreateInput = Prisma.housing_projectUncheckedCreateInput;

export type IdentityProvider = IdentityProviderBase; // nosonar

export type Initiative = InitiativeBase & { permitTypeInitiativeXrefBase?: PermitTypeInitiativeXref };

export type Note = NoteBase; // nosonar - can be removed if type is extended in future

export type NoteHistory = NoteHistoryBase & { note?: Note[] };

export type PiesOnHoldCode = PiesOnHoldCodeBase; // nosonar

type PermitDateTimeKeys =
  | 'submittedDate'
  | 'decisionDate'
  | 'statusLastVerified'
  | 'statusLastChanged'
  | 'submittedTime'
  | 'decisionTime'
  | 'statusLastVerifiedTime'
  | 'statusLastChangedTime';
export type PermitBase = Omit<PermitBasePrisma, PermitDateTimeKeys> & Record<PermitDateTimeKeys, string | null>;
// permitStatusDatesTransform (db/extensions/permitStatusDates.ts) accepts these 8 fields as date/time
// strings on write and converts them to Date before insert - same string override as PermitBase, but
// applied to the create-input shape instead of the read shape.
export type PermitCreateInput = Omit<Prisma.permitUncheckedCreateInput, PermitDateTimeKeys> &
  Record<PermitDateTimeKeys, string | Date | null | undefined>;
interface PermitRelations {
  activity: Activity;
  permitNote: PermitNote[];
  permitTracking: PermitTracking[];
  permitType: PermitType;
}
export type Permit = PermitBase & Partial<PermitRelations>;

export type PermitNote = PermitNoteBase; // nosonar - can be removed if type is extended in future

export type PermitStageCode = PermitStageCodeBase; // nosonar

export type PermitStateCode = PermitStateCodeBase; // nosonar

export type PermitTracking = PermitTrackingBase & { sourceSystemKind?: SourceSystemKind | null };
export type PermitTrackingCreateInput = Prisma.permit_trackingUncheckedCreateInput;
export type PermitTrackingUpsertInput = PermitTrackingCreateInput; // nosonar

export type PermitType = PermitTypeBase; // nosonar - can be removed if type is extended in future

export type PermitTypeInitiativeXref = PermitTypeInitiativeXrefBase & {
  permitType?: PermitType;
  initiative?: Initiative;
};

export type SourceSystemCode = SourceSystemCodeBase; // nosonar

export type SourceSystemKind = SourceSystemKindBase & { permitTypeIds?: number[] };

export type User = UserBase & { identityProvider?: IdentityProvider };

/**
 * Renamed from interfaces/IStamps.ts's IStamps
 * Duplicate of AuditFields+SoftDeleteFields in writable.ts
 * TBD if we can remove this entirely
 */
export interface Stamps {
  createdBy: string | null;
  createdAt: Date | null;
  updatedBy: string | null;
  updatedAt: Date | null;
  deletedBy: string | null;
  deletedAt: Date | null;
}

/**
 * Renamed from interfaces/IProject.ts's IProject; kept distinct from the
 * Project union in common.ts to avoid a naming collision.
 */
export interface ProjectRecord extends Stamps {
  projectId?: string; // Auto populated from the projects PK - for front end use only
  activityId: string;
  assignedUserId: string | null;
  submittedAt: Date;
  applicationStatus: string | null;
  projectName: string | null;
  projectDescription: string | null;
  submissionType: string | null;
  companyNameRegistered: string | null;
  aaiUpdated: boolean;
  astNotes: string | null;
  queuePriority: number | null;
  atsClientId: number | null;
  atsEnquiryId: number | null;
  addedToAts: boolean;
}

export interface BringForward {
  activityId: string;
  noteHistoryId: string;
  projectId?: string;
  enquiryId?: string;
  initiative?: InitiativeEnum;
  title: string;
  projectName: string | null;
  bringForwardDate?: string;
  createdByFullName: string | null;
  escalateToSupervisor: boolean;
  escalateToDirector: boolean;
}

export interface Group extends Partial<Stamps> {
  groupId: number;
  initiativeCode: string;
  initiativeId: string;
  name: GroupName;
  label?: string;
}

export interface UserAccessRequest extends User {
  accessRequest?: AccessRequest;
}
