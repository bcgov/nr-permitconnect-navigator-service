import type {
  CreateRequestDTO,
  DeleteRequestDTO,
  GetRequestDTO,
  ListRequestDTO,
  PatchRequestDTO,
  PutRequestDTO,
  ResourceSchemaConfig,
  UpsertRequestDTO
} from './dto';
import type {
  ActivityContactBase,
  Document,
  Draft,
  ElectrificationProjectBase,
  Enquiry,
  EnquiryBase,
  GeneralProjectBase,
  HousingProjectBase,
  NoteHistoryBase,
  Permit,
  PermitType,
  ProjectBase
} from './resources';
import type { UUID } from '../common';
import type { Nullable, PartialFields } from '../util';
import type { ElectrificationProjectIntake, GeneralProjectIntake, HousingProjectIntake } from '../intakes';
import type { GroupName, Initiative, Resource } from '@/utils/enums/application';

/**
 * Activity Contact
 */

interface ActivityContactSchema extends ResourceSchemaConfig<ActivityContactBase> {
  ids: 'activityId' | 'contactId';
  immutable: 'activityId' | 'contactId';
  scope: 'activityId';
}
export type CreateActivityContactRequest = CreateRequestDTO<ActivityContactBase, ActivityContactSchema>;
export type ListActivityContactsRequest = ListRequestDTO<ActivityContactBase, ActivityContactSchema>;
export type PutActivityContactRequest = PutRequestDTO<ActivityContactBase, ActivityContactSchema>;
export type DeleteActivityContactRequest = DeleteRequestDTO<ActivityContactBase, ActivityContactSchema>;

/**
 * Document
 */

interface DocumentSchema extends ResourceSchemaConfig<Document> {
  ids: 'documentId';
  immutable: 'documentId';
  scope: 'activityId';
}
export interface CreateDocumentRequest {
  document: File;
  activityId: string;
  bucketId: string;
}
export interface DownloadDocumentRequest {
  documentId: UUID;
  filename: string;
  versionId?: string;
}
export type ListDocumentsRequest = ListRequestDTO<Document, DocumentSchema>;
export type DeleteDocumentRequest = DeleteRequestDTO<Document, DocumentSchema> & {
  versionId?: string;
};

/**
 * Draft
 */

interface DraftSchema extends ResourceSchemaConfig<Draft<unknown>> {
  ids: 'draftId';
  immutable: 'draftId' | 'activityId' | 'draftCode';
}
export type GetDraftRequest = GetRequestDTO<Draft<unknown>, DraftSchema>;
export type UpsertDraftRequest = UpsertRequestDTO<Draft<unknown>, DraftSchema>;
export type DeleteDraftRequest = DeleteRequestDTO<Draft<unknown>, DraftSchema>;

/**
 * Electrification Project
 */

interface ElectrificationProjectBaseSchema extends ResourceSchemaConfig<ElectrificationProjectBase> {
  ids: 'projectId';
  immutable: 'activityId' | 'electrificationProjectId' | 'projectId';
  serverGenerated: 'activityId' | 'electrificationProjectId' | 'projectId';
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
export type ListElectrificationProjectsRequest = ListRequestDTO<
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
  Pick<Enquiry, 'contact' | 'enquiryDescription' | 'relatedActivityId' | 'submissionType'>,
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
  ids: 'projectId';
  immutable: 'activityId' | 'generalProjectId' | 'projectId';
  serverGenerated: 'activityId' | 'generalProjectId' | 'projectId';
  query: {
    activityId: string[];
    createdBy: string[];
    includeUser: boolean;
    generalProjectId: string[];
    submissionType: string[];
  };
}
export type CreateGeneralProjectRequest = CreateRequestDTO<Partial<GeneralProjectBase>, GeneralProjectBaseSchema>;
export type ListGeneralProjectsRequest = ListRequestDTO<Partial<GeneralProjectBase>, GeneralProjectBaseSchema>;
export type PatchGeneralProjectRequest = PatchRequestDTO<GeneralProjectBase, GeneralProjectBaseSchema>;
export type SubmitDraftGeneralProjectRequest = GeneralProjectIntake;

/**
 * Housing Project
 */

interface HousingProjectBaseSchema extends ResourceSchemaConfig<HousingProjectBase> {
  ids: 'projectId';
  immutable: 'activityId' | 'housingProjectId' | 'projectId';
  serverGenerated: 'activityId' | 'housingProjectId' | 'projectId';
  query: {
    activityId: string[];
    createdBy: string[];
    includeUser: boolean;
    housingProjectId: string[];
    submissionType: string[];
  };
}
export type CreateHousingProjectRequest = CreateRequestDTO<Partial<HousingProjectBase>, HousingProjectBaseSchema>;
export type ListHousingProjectRequest = ListRequestDTO<Partial<HousingProjectBase>, HousingProjectBaseSchema>;
export type PatchHousingProjectRequest = PatchRequestDTO<HousingProjectBase, HousingProjectBaseSchema>;
export type SubmitDraftHousingProjectRequest = HousingProjectIntake;

/**
 * Note History
 */

interface NoteHistoryBaseSchema extends ResourceSchemaConfig<NoteHistoryBase> {
  ids: 'noteHistoryId';
  immutable: 'noteHistoryId';
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
export type PutNoteHistoryRequest = PutRequestDTO<NoteHistoryBase & { resource: Resource }, NoteHistoryBaseSchema> & {
  note: string;
};
export type DeleteNoteHistoryRequest = DeleteRequestDTO<NoteHistoryBase, NoteHistoryBaseSchema>;

/**
 * Permit
 */

interface PermitSchema extends ResourceSchemaConfig<Permit> {
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
export type UpsertPermitRequest = UpsertRequestDTO<Permit, PermitSchema>;

/**
 * Permit Type
 */

interface PermitTypeSchema extends ResourceSchemaConfig<PermitType> {
  query: {
    initiative: Initiative;
  };
}
export type ListPermitTypesRequest = ListRequestDTO<PermitType, PermitTypeSchema>;

/**
 * Project
 */

interface ProjectSchema extends ResourceSchemaConfig<ProjectBase> {
  ids: 'projectId';
  immutable: 'activityId' | 'projectId';
  serverGenerated: 'activityId' | 'projectId';
}
export type CreateProjectRequest = CreateRequestDTO<Partial<ProjectBase>, ProjectSchema>;
export type GetProjectRequest = GetRequestDTO<ProjectBase, ProjectSchema>;
export interface GetProjectStatisticsRequest {
  dateFrom?: Date;
  dateTo?: Date;
  monthYear?: Date;
  userId?: string;
}
export type PatchProjectRequest = PatchRequestDTO<ProjectBase, ProjectSchema>;
export type DeleteProjectRequest = DeleteRequestDTO<ProjectBase, ProjectSchema>;

/**
 * Other
 */
export interface ContactSearchParameters {
  contactApplicantRelationship?: string;
  contactPreference?: string;
  contactId?: string[];
  email?: string;
  firstName?: string;
  hasActivity?: boolean;
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
}

export interface UserSearchParameters {
  userId?: string[];
  idp?: string[];
  sub?: string;
  email?: string;
  firstName?: string;
  fullName?: string;
  lastName?: string;
  active?: boolean;
  group?: GroupName[];
  includeUserGroups?: boolean;
  initiative?: Initiative[];
}
