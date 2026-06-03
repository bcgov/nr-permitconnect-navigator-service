import type { GroupName, Initiative } from '@/utils/enums/application';
import type { PaginationOptions } from '../common';

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
