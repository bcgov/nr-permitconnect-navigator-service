import type { ParsedQs } from 'qs';
import type { DeleteRequestDTO, GetRequestDTO, ListRequestDTO, ResourceSchemaConfig, UpsertRequestDTO } from './dto.ts';
import type { Permit, PermitBase, Stamps } from './resources.ts';
import type { PaginationOptions } from '../common.ts';
import type { Nullable } from '../utils.ts';
import type { GroupName, Initiative } from '../../utils/enums/application.ts';
import type { EmailTemplate } from '../../utils/templates';

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

export interface ElectrificationProjectSearchParameters {
  activityId?: string[];
  createdBy?: string[];
  electrificationProjectId?: string[];
  projectType?: string[];
  projectCategory?: string[];
  includeUser?: boolean;
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

export interface EnquirySearchParameters {
  activityId?: string[];
  createdBy?: string[];
  enquiryId?: string[];
  includeUser?: boolean;
}

export interface GeneralProjectSearchParameters {
  activityId?: string[];
  createdBy?: string[];
  generalProjectId?: string[];
  submissionType?: string[];
  includeUser?: boolean;
}

export interface HousingProjectSearchParameters {
  activityId?: string[];
  createdBy?: string[];
  housingProjectId?: string[];
  submissionType?: string[];
  includeUser?: boolean;
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
