// *CreateInput = Prisma.xUncheckedCreateInput. Only for repository-layer create() calls feeding Prisma
// directly - domain/service create paths use these so plain JS values (number, unknown) work without
// casting to Decimal/JsonValue. Not for read payloads (*Base) or request/service-layer types (see domain.ts).

import { Prisma } from '#prismaClient';

import type { z } from 'zod';
import type { GroupName } from '#src/utils/enums/application';
import type { accessRequestSchema } from '#src/schemas/response/accessRequest';
import type { activityContactSchema } from '#src/schemas/response/activityContact';
import type { contactSchema } from '#src/schemas/response/contact';
import type { documentSchema } from '#src/schemas/response/document';
import type { draftSchema } from '#src/schemas/response/draft';
import type { electrificationProjectSchema } from '#src/schemas/response/electrificationProject';
import type { enquirySchema } from '#src/schemas/response/enquiry';
import type { generalProjectSchema } from '#src/schemas/response/generalProject';
import type { housingProjectSchema } from '#src/schemas/response/housingProject';
import type { bringForwardSchema, noteHistorySchema } from '#src/schemas/response/noteHistory';
import type { permitSchema, permitTrackingSchema } from '#src/schemas/response/permit';
import type { permitTypeSchema } from '#src/schemas/response/permitType';
import type { sourceSystemKindSchema } from '#src/schemas/response/sourceSystemKind';
import type { userSchema } from '#src/schemas/response/user';

import type {
  activity as ActivityBase,
  contact as ContactBase,
  electrification_project as ElectrificationProjectBase,
  general_project as GeneralProjectBase,
  housing_project as HousingProjectBase,
  initiative as InitiativeBase,
  note as NoteBase,
  permit_note as PermitNoteBase,
  permit_tracking as PermitTrackingBase
} from '#prismaClient';

export type {
  ActivityBase,
  ContactBase,
  ElectrificationProjectBase,
  GeneralProjectBase,
  HousingProjectBase,
  InitiativeBase,
  NoteBase,
  PermitNoteBase,
  PermitTrackingBase
};

export type AccessRequest = z.infer<typeof accessRequestSchema>;

export type ActivityContact = z.infer<typeof activityContactSchema>;

export type Contact = z.infer<typeof contactSchema>;
export type ContactCreateInput = Prisma.contactUncheckedCreateInput;

export type Draft = z.infer<typeof draftSchema>;
export type DraftCreateInput = Prisma.draftUncheckedCreateInput;

export type Document = z.infer<typeof documentSchema>;

export type ElectrificationProject = z.infer<typeof electrificationProjectSchema>;
export type ElectrificationProjectCreateInput = Prisma.electrification_projectUncheckedCreateInput;

export type Enquiry = z.infer<typeof enquirySchema>;

export type GeneralProject = z.infer<typeof generalProjectSchema>;
export type GeneralProjectCreateInput = Prisma.general_projectUncheckedCreateInput;

export type HousingProject = z.infer<typeof housingProjectSchema>;
export type HousingProjectCreateInput = Prisma.housing_projectUncheckedCreateInput;

export type Note = NoteBase; // nosonar

export type NoteHistory = z.infer<typeof noteHistorySchema>;

type PermitDateTimeKeys =
  | 'submittedDate'
  | 'decisionDate'
  | 'statusLastVerified'
  | 'statusLastChanged'
  | 'submittedTime'
  | 'decisionTime'
  | 'statusLastVerifiedTime'
  | 'statusLastChangedTime';
// permitStatusDatesTransform (db/extensions/permitStatusDates.ts) accepts these 8 fields as date/time
// strings on write and converts them to Date before insert - permitSchema models the same string
// override on the read side (see schemas/permitSchema.ts).
export type PermitCreateInput = Omit<Prisma.permitUncheckedCreateInput, PermitDateTimeKeys> &
  Record<PermitDateTimeKeys, string | Date | null | undefined>;
export type Permit = z.infer<typeof permitSchema>;

export type PermitNote = PermitNoteBase; // nosonar

export type PermitTracking = z.infer<typeof permitTrackingSchema>;
export type PermitTrackingCreateInput = Prisma.permit_trackingUncheckedCreateInput;
export type PermitTrackingUpsertInput = PermitTrackingCreateInput; // nosonar

export type PermitType = z.infer<typeof permitTypeSchema>;

export type SourceSystemKind = z.infer<typeof sourceSystemKindSchema>;

// no endpoint ever includes identityProvider (see src/services/user.ts), so it's dropped here.
export type User = z.infer<typeof userSchema>;

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

export type BringForward = z.infer<typeof bringForwardSchema>;

export interface Group extends Partial<Stamps> {
  groupId: number;
  initiativeCode: string;
  initiativeId: string;
  name: GroupName;
  label: string;
}
