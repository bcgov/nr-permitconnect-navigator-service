import type { ParsedQs } from 'qs';
import type {
  CreateRequestDTO,
  DeleteRequestDTO,
  GetRequestDTO,
  ListRequestDTO,
  PatchRequestDTO,
  ResourceSchemaConfig,
  UpsertRequestDTO
} from './dto.ts';
import type {
  ContactBase,
  ElectrificationProjectBase,
  EnquiryBase,
  GeneralProjectBase,
  HousingProjectBase,
  NoteHistoryBase,
  Permit,
  PermitBase,
  Stamps
} from './resources.ts';
import type { ElectrificationProjectIntake, GeneralProjectIntake, HousingProjectIntake } from '../intakes.ts';
import type { PaginationOptions } from '#src/types/common';
import type { Nullable, PartialFields } from '#src/types/utils';
import type { GroupName, Initiative, Resource } from '#src/utils/enums/application';
import type { EmailTemplate } from '#src/utils/templates';

/**
 * Contact
 */

interface ContactBaseSchema extends ResourceSchemaConfig<ContactBase> {
  ids: 'contactId';
  immutable: 'contactId';
  serverGenerated: 'contactId';
}

export type CreateContactRequest = CreateRequestDTO<ContactBase, ContactBaseSchema>;
export type UpsertContactRequest = UpsertRequestDTO<ContactBase, ContactBaseSchema>;

/**
 * Electrification Project
 */

interface ElectrificationProjectBaseSchema extends ResourceSchemaConfig<ElectrificationProjectBase> {
  ids: 'electrificationProjectId';
  immutable: 'activityId' | 'electrificationProjectId';
  serverGenerated: 'activityId' | 'electrificationProjectId';
  query: {
    activityId: string[];
    createdBy: string[];
    includeUser: boolean;
    electrificationProjectId: string[];
    projectType: string[];
    projectCategory: string[];
  };
}

export type CreateElectrificationProjectRequest = CreateRequestDTO<
  Partial<ElectrificationProjectBase>,
  ElectrificationProjectBaseSchema
>;
export type SearchElectrificationProjectRequest = ListRequestDTO<
  Partial<ElectrificationProjectBase>,
  ElectrificationProjectBaseSchema
>;
export type PatchElectrificationProjectRequest = PatchRequestDTO<
  ElectrificationProjectBase,
  ElectrificationProjectBaseSchema
>;
export type SubmitDraftElectrificationProjectRequest = ElectrificationProjectIntake;

/**
 * Enquiry
 */

interface EnquiryBaseSchema extends ResourceSchemaConfig<EnquiryBase> {
  ids: 'enquiryId';
  immutable: 'activityId' | 'enquiryId';
  serverGenerated: 'activityId' | 'enquiryId';
}
interface EnquiryListRelatedSchema extends EnquiryBaseSchema {
  scope: 'activityId';
}
interface EnquirySearchSchema extends EnquiryBaseSchema {
  query: { activityId: string[]; createdBy: string[]; enquiryId: string[]; includeUser: boolean };
}
export type CreateEnquiryRequest = PartialFields<
  Pick<EnquiryBase, 'enquiryDescription' | 'relatedActivityId' | 'submissionType'> & { contact: ContactBase },
  'submissionType'
>;
export type GetEnquiryRequest = GetRequestDTO<EnquiryBase, EnquiryBaseSchema>;
export type ListRelatedEnquiriesRequest = ListRequestDTO<EnquiryBase, EnquiryListRelatedSchema>;
export type SearchEnquiriesRequest = ListRequestDTO<EnquiryBase, EnquirySearchSchema>;
export type PatchEnquiryRequest = PatchRequestDTO<EnquiryBase, EnquiryBaseSchema>;
export type DeleteEnquiryRequest = DeleteRequestDTO<EnquiryBase, EnquiryBaseSchema>;

/**
 * General Project
 */

interface GeneralProjectBaseSchema extends ResourceSchemaConfig<GeneralProjectBase> {
  ids: 'generalProjectId';
  immutable: 'activityId' | 'generalProjectId';
  serverGenerated: 'activityId' | 'generalProjectId';
  query: {
    activityId: string[];
    createdBy: string[];
    includeUser: boolean;
    generalProjectId: string[];
    submissionType: string[];
  };
}

export type CreateGeneralProjectRequest = CreateRequestDTO<Partial<GeneralProjectBase>, GeneralProjectBaseSchema>;
export type SearchGeneralProjectRequest = ListRequestDTO<Partial<GeneralProjectBase>, GeneralProjectBaseSchema>;
export type PatchGeneralProjectRequest = PatchRequestDTO<GeneralProjectBase, GeneralProjectBaseSchema>;
export type SubmitDraftGeneralProjectRequest = GeneralProjectIntake;

/**
 * Housing Project
 */

interface HousingProjectBaseSchema extends ResourceSchemaConfig<HousingProjectBase> {
  ids: 'housingProjectId';
  immutable: 'activityId' | 'housingProjectId';
  serverGenerated: 'activityId' | 'housingProjectId';
  query: {
    activityId: string[];
    createdBy: string[];
    includeUser: boolean;
    housingProjectId: string[];
    submissionType: string[];
  };
}

export type CreateHousingProjectRequest = CreateRequestDTO<Partial<HousingProjectBase>, HousingProjectBaseSchema>;
export type SearchHousingProjectRequest = ListRequestDTO<Partial<HousingProjectBase>, HousingProjectBaseSchema>;
export type PatchHousingProjectRequest = PatchRequestDTO<HousingProjectBase, HousingProjectBaseSchema>;
export type SubmitDraftHousingProjectRequest = HousingProjectIntake;

/**
 * Note History
 */

interface NoteHistoryBaseSchema extends ResourceSchemaConfig<NoteHistoryBase> {
  ids: 'noteHistoryId';
  immutable: 'activityId' | 'noteHistoryId';
  serverGenerated: 'noteHistoryId';
}
interface NoteHistoryBringForwardSchema extends NoteHistoryBaseSchema {
  query: {
    bringForwardState: Nullable<string>;
  };
}
interface NoteHistoryQuerySchema extends NoteHistoryBaseSchema {
  scope: 'activityId';
}
export type CreateNoteHistoryRequest = CreateRequestDTO<NoteHistoryBase, NoteHistoryBaseSchema> & { note: string };
export type ListBringForwardsRequest = ListRequestDTO<NoteHistoryBase, NoteHistoryBringForwardSchema>;
export type ListNoteHistoriesRequest = ListRequestDTO<NoteHistoryBase, NoteHistoryQuerySchema>;
export type PatchNoteHistoryRequest = PatchRequestDTO<NoteHistoryBase, NoteHistoryBaseSchema> & {
  note: string | undefined;
  resource: Resource;
};
export type DeleteNoteHistoryRequest = DeleteRequestDTO<NoteHistoryBase, NoteHistoryBaseSchema>;

/**
 * Permit
 */

interface PermitSchema extends ResourceSchemaConfig<PermitBase> {
  ids: 'permitId';
  immutable: 'permitId';
  serverGenerated: 'permitId';
  query: {
    activityId: string;
    dateRange: [Date, Date];
    includeNotes: boolean;
    permitTypeId: number;
    searchTag: string;
    sourceSystemKindId: number;
  };
}
export type DeletePermitRequest = DeleteRequestDTO<Permit, PermitSchema>;
export type GetPermitRequest = GetRequestDTO<Permit, PermitSchema>;
export type ListPermitsRequest = ListRequestDTO<Permit, PermitSchema>;
export type UpsertPermitRequest = UpsertRequestDTO<PermitBase, PermitSchema>;

export interface ContactSearchParameters {
  contactApplicantRelationship?: string;
  contactPreference?: string;
  contactId?: string[];
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  userId?: string[];
  initiative?: Initiative;
  includeActivities?: boolean;
}

export interface Email {
  bcc?: string[];
  bodyType: string;
  body: string;
  cc?: string[];
  delayTS?: number;
  encoding?: string;
  from: string;
  priority?: string;
  subject: string;
  to: string[];
  tag?: string;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  content: string;
  contentType: string;
  encoding: string;
  filename: string;
}

export interface IdirSearchParameters extends ParsedQs {
  firstName: string;
  lastName: string;
  email: string;
}

export interface IntakePermitRequest {
  activityId: string;
  permitTypeId: number;
  trackingId?: Nullable<string>;
  submittedDate?: string;
}

export interface ListPermitsOptions extends Partial<Stamps> {
  activityId?: string;
  includeNotes?: boolean;
}

export interface PermitSearchParams {
  permitId?: string[];
  activityId?: string[];
  permitTypeId?: number[];
  stage?: string[];
  state?: string[];
  sourceSystems?: string[];
  includePermitNotes?: boolean;
  includePermitTracking?: boolean;
  includePermitType?: boolean;
  onlyPeachIntegratedTrackings?: boolean;
}

export interface PermitUpdateEmailParams {
  permit: Permit;
  initiative: Initiative;
  dearName: string;
  projectId: string;
  toEmails: string[];
  emailTemplate: EmailTemplate;
}

export interface SearchPermitsOptions extends PaginationOptions {
  dateRange?: [Date, Date];
  permitTypeId?: string;
  searchTag?: string;
  sourceSystemKindId?: string;
}

export interface UpdatedPermitWithNote {
  permit: Permit;
  note: string | undefined;
}

export interface UserSearchParameters {
  userId?: string[];
  idp?: string[];
  group?: GroupName[];
  sub?: string;
  email?: string;
  firstName?: string;
  fullName?: string;
  lastName?: string;
  active?: boolean;
  includeUserGroups?: boolean;
  initiative?: Initiative[];
}
