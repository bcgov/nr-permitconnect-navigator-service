import type { GroupName, Initiative, Resource } from '@/utils/enums/application';
import type { PaginationOptions } from '../common';
import type {
  CreateRequestDTO,
  DeleteRequestDTO,
  GetRequestDTO,
  ListRequestDTO,
  PatchRequestDTO,
  PutRequestDTO,
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
  NoteHistory,
  ProjectBase
} from './resources';
import type { UUID } from '../common';
import type { PartialFields } from '../util';
import type { ElectrificationProjectIntake, GeneralProjectIntake, HousingProjectIntake } from '../intakes';

/**
 * Activity Contact
 */

export type CreateActivityContactRequest = CreateRequestDTO<ActivityContactBase>;
export type ListActivityContactsRequest = ListRequestDTO<ActivityContactBase, ['activityId']>;
export type PutActivityContactRequest = PutRequestDTO<ActivityContactBase, ['activityId' | 'contactId']>;
export type DeleteActivityContactRequest = DeleteRequestDTO<ActivityContactBase, ['activityId', 'contactId']>;

/**
 * Document
 */

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
export type ListDocumentsRequest = ListRequestDTO<Document, ['activityId']>;
export type DeleteDocumentRequest = DeleteRequestDTO<Document, ['documentId']> & {
  versionId?: string;
};

/**
 * Draft
 */

export type GetDraftRequest = GetRequestDTO<Draft<unknown>, ['draftId']>;
export type UpsertDraftRequest = UpsertRequestDTO<Draft<unknown>, ['draftId', 'activityId'], ['draftCode']>;
export type DeleteDraftRequest = DeleteRequestDTO<Draft<unknown>, ['draftId']>;

/**
 * Electrification Project
 */

export type CreateElectrificationProjectRequest = CreateRequestDTO<
  Partial<ElectrificationProjectBase>,
  ['activityId', 'electrificationProjectId', 'projectId']
>;
export interface SearchElectrificationProjectsRequest {
  activityId?: string[];
  createdBy?: string[];
  includeUser?: boolean;
  electrificationProjectId?: string[];
  projectType?: string[];
  projectCategory?: string[];
}
export type PatchElectrificationProjectRequest = PatchRequestDTO<
  ElectrificationProjectBase,
  ['projectId'],
  ['activityId']
>;
export type SubmitDraftElectrificationProjectRequest = CreateRequestDTO<ElectrificationProjectIntake>;

/**
 * Enquiry
 */

export type CreateEnquiryRequest = CreateRequestDTO<
  PartialFields<
    Pick<Enquiry, 'contact' | 'enquiryDescription' | 'relatedActivityId' | 'submissionType'>,
    'submissionType'
  >
>;
export type GetEnquiryRequest = GetRequestDTO<EnquiryBase, ['enquiryId']>;
export type ListRelatedEnquiriesRequest = ListRequestDTO<EnquiryBase, ['activityId']>;
export interface SearchEnquiriesRequest {
  activityId?: string[];
  createdBy?: string[];
  enquiryId?: string[];
  includeUser?: boolean;
}
export type PatchEnquiryRequest = PatchRequestDTO<EnquiryBase, ['enquiryId']>;
export type DeleteEnquiryRequest = DeleteRequestDTO<EnquiryBase, ['enquiryId']>;

/**
 * General Project
 */

export type CreateGeneralProjectRequest = CreateRequestDTO<
  Partial<GeneralProjectBase>,
  ['activityId', 'generalProjectId', 'projectId']
>;
export interface SearchGeneralProjectsRequest {
  activityId?: string[];
  createdBy?: string[];
  includeUser?: boolean;
  generalProjectId?: string[];
  submissionType?: string[];
}
export type PatchGeneralProjectRequest = PatchRequestDTO<GeneralProjectBase, ['projectId'], ['activityId']>;
export type SubmitDraftGeneralProjectRequest = CreateRequestDTO<GeneralProjectIntake>;

/**
 * Housing Project
 */

export type CreateHousingProjectRequest = CreateRequestDTO<
  Partial<HousingProjectBase>,
  ['activityId', 'housingProjectId', 'projectId']
>;
export interface SearchHousingProjectsRequest {
  activityId?: string[];
  createdBy?: string[];
  includeUser?: boolean;
  housingProjectId?: string[];
  submissionType?: string[];
}
export type PatchHousingProjectRequest = PatchRequestDTO<HousingProjectBase, ['projectId'], ['activityId']>;
export type SubmitDraftHousingProjectRequest = CreateRequestDTO<HousingProjectIntake>;

/**
 * Note History
 */

export type CreateNoteHistoryRequest = CreateRequestDTO<NoteHistory, ['noteHistoryId']>;
export type ListBringForwardsRequest = ListRequestDTO<NoteHistory, ['bringForwardState']>;
export type ListNoteHistoriesRequest = ListRequestDTO<NoteHistory, ['activityId']>;
export type PutNoteHistoryRequest = PutRequestDTO<NoteHistory & { resource: Resource }, ['noteHistoryId']>;
export type DeleteNoteHistoryRequest = DeleteRequestDTO<NoteHistory, ['noteHistoryId']>;

/**
 * Project
 */

export type CreateProjectRequest = CreateRequestDTO<Partial<ProjectBase>, ['activityId', 'projectId']>;
export type GetProjectRequest = GetRequestDTO<ProjectBase, ['projectId']>;
export interface GetProjectStatisticsRequest {
  dateFrom?: Date;
  dateTo?: Date;
  monthYear?: Date;
  userId?: string;
}
export type PatchProjectRequest = PatchRequestDTO<ProjectBase, ['projectId']>;
export type DeleteProjectRequest = DeleteRequestDTO<ProjectBase, ['projectId']>;

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

export interface ListPermitsOptions {
  activityId?: string;
  includeNotes?: boolean;
}

export interface SearchPermitsOptions extends PaginationOptions {
  dateRange?: [Date, Date];
  permitTypeId?: number;
  searchTag?: string;
  sourceSystemKindId?: number;
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
