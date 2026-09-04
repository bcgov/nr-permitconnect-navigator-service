/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * File may be deprecated once we upgrade to Prisma 7 as contains a lot more auto generation of types for you
 */

// *CreateInput = Prisma.xUncheckedCreateInput. Only for repository-layer create() calls feeding Prisma
// directly - domain/service create paths use these so plain JS values (number, unknown) work without
// casting to Decimal/JsonValue. Not for read payloads (*Base) or request/service-layer types (see domain.ts).

import { Prisma } from '@prisma/client';

import type { GroupName, Initiative as InitiativeEnum } from '#src/utils/enums/application';

const accessRequestBase = Prisma.validator<Prisma.access_requestDefaultArgs>()({});
export type AccessRequestBase = Prisma.access_requestGetPayload<typeof accessRequestBase>;
export type AccessRequest = AccessRequestBase; // nosonar - can be removed if type is extended in future
export type AccessRequestPatch = Omit<Prisma.access_requestUpdateInput, 'accessRequestId'>;

const activityBase = Prisma.validator<Prisma.activityDefaultArgs>()({});
export type ActivityBase = Prisma.activityGetPayload<typeof activityBase>;
export type Activity = ActivityBase & {
  activityContact?: ActivityContact[];
  initiative?: Initiative;
};

const activityContactBase = Prisma.validator<Prisma.activity_contactDefaultArgs>()({});
export type ActivityContactBase = Prisma.activity_contactGetPayload<typeof activityContactBase>;
export type ActivityContact = ActivityContactBase & { contact?: Contact };

const businessAreaCodeBase = Prisma.validator<Prisma.business_area_codeDefaultArgs>()({});
export type BusinessAreaCodeBase = Prisma.business_area_codeGetPayload<typeof businessAreaCodeBase>;
export type BusinessAreaCode = BusinessAreaCodeBase; // nosonar
const contactBase = Prisma.validator<Prisma.contactDefaultArgs>()({});
export type ContactBase = Prisma.contactGetPayload<typeof contactBase>;
export type Contact = ContactBase & { activityContact?: ActivityContact[]; user?: User | null };
export type ContactCreateInput = Prisma.contactUncheckedCreateInput;

const draftBase = Prisma.validator<Prisma.draftDefaultArgs>()({});
export type DraftBase = Prisma.draftGetPayload<typeof draftBase>;
export type Draft = DraftBase & { activity?: Activity };
export type DraftCreateInput = Prisma.draftUncheckedCreateInput;

const documentBase = Prisma.validator<Prisma.documentDefaultArgs>()({});
export type DocumentBase = Prisma.documentGetPayload<typeof documentBase>;
export type Document = Omit<DocumentBase, 'filesize'> & { createdByFullName?: string; filesize: number };

const electrificationProjectBase = Prisma.validator<Prisma.electrification_projectDefaultArgs>()({});
export type ElectrificationProjectBase = Prisma.electrification_projectGetPayload<typeof electrificationProjectBase>;
export type ElectrificationProject = ElectrificationProjectBase & {
  activity?: Activity;
  projectId?: string;
  user?: User | null;
};
export type ElectrificationProjectCreateInput = Prisma.electrification_projectUncheckedCreateInput;

const electrificationProjectCategoryCodeBase =
  Prisma.validator<Prisma.electrification_project_category_codeDefaultArgs>()({});
export type ElectrificationProjectCategoryCodeBase = Prisma.electrification_project_category_codeGetPayload<
  typeof electrificationProjectCategoryCodeBase
>;
export type ElectrificationProjectCategoryCode = ElectrificationProjectCategoryCodeBase; // nosonar

const electrificationProjectTypeCodeBase = Prisma.validator<Prisma.electrification_project_type_codeDefaultArgs>()({});
export type ElectrificationProjectTypeCodeBase = Prisma.electrification_project_type_codeGetPayload<
  typeof electrificationProjectTypeCodeBase
>;
export type ElectrificationProjectTypeCode = ElectrificationProjectTypeCodeBase; // nosonar

const emailLogBase = Prisma.validator<Prisma.email_logDefaultArgs>()({});
export type EmailLogBase = Prisma.email_logGetPayload<typeof emailLogBase>;
export type EmailLog = EmailLogBase; // nosonar - can be removed if type is extended in future

const enquiryBase = Prisma.validator<Prisma.enquiryDefaultArgs>()({});
export type EnquiryBase = Prisma.enquiryGetPayload<typeof enquiryBase>;
export type Enquiry = EnquiryBase & { activity?: Activity; user?: User | null };

const escalationTypeCodeBase = Prisma.validator<Prisma.escalation_type_codeDefaultArgs>()({});
export type EscalationTypeCodeBase = Prisma.escalation_type_codeGetPayload<typeof escalationTypeCodeBase>;
export type EscalationTypeCode = EscalationTypeCodeBase; // nosonar

const generalProjectBase = Prisma.validator<Prisma.general_projectDefaultArgs>()({});
export type GeneralProjectBase = Prisma.general_projectGetPayload<typeof generalProjectBase>;
export type GeneralProject = GeneralProjectBase & { activity?: Activity; projectId?: string; user?: User | null };
export type GeneralProjectCreateInput = Prisma.general_projectUncheckedCreateInput;

const housingProjectBase = Prisma.validator<Prisma.housing_projectDefaultArgs>()({});
export type HousingProjectBase = Prisma.housing_projectGetPayload<typeof housingProjectBase>;
export type HousingProject = HousingProjectBase & {
  activity?: Activity;
  projectId?: string;
  user?: User | null;
};
export type HousingProjectCreateInput = Prisma.housing_projectUncheckedCreateInput;

const identityProviderBase = Prisma.validator<Prisma.identity_providerDefaultArgs>()({});
export type IdentityProviderBase = Prisma.identity_providerGetPayload<typeof identityProviderBase>;
export type IdentityProvider = IdentityProviderBase; // nosonar

const initiativeBase = Prisma.validator<Prisma.initiativeDefaultArgs>()({});
export type InitiativeBase = Prisma.initiativeGetPayload<typeof initiativeBase>;
export type Initiative = InitiativeBase & { permitTypeInitiativeXrefBase?: PermitTypeInitiativeXref };

const noteBase = Prisma.validator<Prisma.noteDefaultArgs>()({});
export type NoteBase = Prisma.noteGetPayload<typeof noteBase>;
export type Note = NoteBase; // nosonar - can be removed if type is extended in future

const noteHistoryBase = Prisma.validator<Prisma.note_historyDefaultArgs>()({});
export type NoteHistoryBase = Prisma.note_historyGetPayload<typeof noteHistoryBase>;
export type NoteHistory = NoteHistoryBase & { note?: Note[] };

const piesOnHoldCodeBase = Prisma.validator<Prisma.pies_on_hold_codeDefaultArgs>()({});
export type PiesOnHoldCodeBase = Prisma.pies_on_hold_codeGetPayload<typeof piesOnHoldCodeBase>;
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
const permitBase = Prisma.validator<Prisma.permitDefaultArgs>()({});
type PermitBasePrisma = Prisma.permitGetPayload<typeof permitBase>;
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

const permitNoteBase = Prisma.validator<Prisma.permit_noteDefaultArgs>()({});
export type PermitNoteBase = Prisma.permit_noteGetPayload<typeof permitNoteBase>;
export type PermitNote = PermitNoteBase; // nosonar - can be removed if type is extended in future

const permitStageCodeBase = Prisma.validator<Prisma.permit_stage_codeDefaultArgs>()({});
export type PermitStageCodeBase = Prisma.permit_stage_codeGetPayload<typeof permitStageCodeBase>;
export type PermitStageCode = PermitStageCodeBase; // nosonar

const permitStateCodeBase = Prisma.validator<Prisma.permit_state_codeDefaultArgs>()({});
export type PermitStateCodeBase = Prisma.permit_state_codeGetPayload<typeof permitStateCodeBase>;
export type PermitStateCode = PermitStateCodeBase; // nosonar

const permitTrackingBase = Prisma.validator<Prisma.permit_trackingDefaultArgs>()({});
export type PermitTrackingBase = Prisma.permit_trackingGetPayload<typeof permitTrackingBase>;
export type PermitTracking = PermitTrackingBase & { sourceSystemKind?: SourceSystemKind | null };
export type PermitTrackingCreateInput = Prisma.permit_trackingUncheckedCreateInput;
export type PermitTrackingUpsertInput = PermitTrackingCreateInput; // nosonar

const permitTypeBase = Prisma.validator<Prisma.permit_typeDefaultArgs>()({});
export type PermitTypeBase = Prisma.permit_typeGetPayload<typeof permitTypeBase>;
export type PermitType = PermitTypeBase; // nosonar - can be removed if type is extended in future

const permitTypeInitiativeXrefBase = Prisma.validator<Prisma.permit_type_initiative_xrefDefaultArgs>()({});
export type PermitTypeInitiativeXrefBase = Prisma.permit_typeGetPayload<typeof permitTypeInitiativeXrefBase>;
export type PermitTypeInitiativeXref = PermitTypeInitiativeXrefBase & {
  permitType?: PermitType;
  initiative?: Initiative;
};

const sourceSystemCodeBase = Prisma.validator<Prisma.source_system_codeDefaultArgs>()({});
export type SourceSystemCodeBase = Prisma.source_system_codeGetPayload<typeof sourceSystemCodeBase>;
export type SourceSystemCode = SourceSystemCodeBase; // nosonar

const sourceSystemKindBase = Prisma.validator<Prisma.source_system_kindDefaultArgs>()({});
export type SourceSystemKindBase = Prisma.source_system_kindGetPayload<typeof sourceSystemKindBase>;
export type SourceSystemKind = SourceSystemKindBase & { permitTypeIds?: number[] };

const user = Prisma.validator<Prisma.userDefaultArgs>()({});
export type UserBase = Prisma.userGetPayload<typeof user>;
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
