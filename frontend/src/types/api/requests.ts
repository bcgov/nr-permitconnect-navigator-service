import type { GroupName, Initiative } from '@/utils/enums/application';
import type { PaginationOptions } from '../common';
import type { CreateRequestDTO, DeleteRequestDTO, GetRequestDTO, ListRequestDTO, PutRequestDTO } from './dto';
import type { ActivityContactBase, Document, EnquiryBase } from './resources';
import type { UUID } from '../common';

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
 * Enquiry
 */

export type CreateEnquiryRequest = CreateRequestDTO<EnquiryBase, ['enquiryId']>;
export type GetEnquiryRequest = GetRequestDTO<EnquiryBase, ['enquiryId']>;
export type ListEnquiriesRequest = ListRequestDTO<EnquiryBase, ['activityId']>;
export type PutEnquiryRequest = PutRequestDTO<EnquiryBase, ['enquiryId']>;
export type DeleteEnquiryRequest = DeleteRequestDTO<EnquiryBase, ['enquiryId']>;

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

export interface ElectrificationProjectSearchParameters {
  activityId?: string[];
  createdBy?: string[];
  includeUser?: boolean;
  electrificationProjectId?: string[];
  projectType?: string[];
  projectCategory?: string[];
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

export interface EnquirySearchParameters {
  activityId?: string[];
  createdBy?: string[];
  enquiryId?: string[];
  includeUser?: boolean;
}

export interface GeneralProjectSearchParameters {
  activityId?: string[];
  createdBy?: string[];
  includeUser?: boolean;
  generalProjectId?: string[];
  submissionType?: string[];
}

export interface HousingProjectSearchParameters {
  activityId?: string[];
  createdBy?: string[];
  includeUser?: boolean;
  housingProjectId?: string[];
  submissionType?: string[];
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

export interface StatisticFilters {
  dateFrom?: Date;
  dateTo?: Date;
  monthYear?: Date;
  userId?: string;
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
