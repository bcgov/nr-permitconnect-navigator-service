import type { AuditFields, ContactBase, PermitTracking } from './resources';
import type { KeyValuePair } from '../common';
import type { GroupName, Initiative } from '@/utils/enums/application';
import type { AxiosRequestConfig } from 'axios';

/**
 * Contact
 */

export type CreateContactRequest = Omit<ContactBase, 'contactId' | keyof AuditFields>;

/**
 * Other
 */

export interface CreateObjectRequest {
  file: File;
  metadata?: KeyValuePair[];
  bucketId?: string;
  tagset?: KeyValuePair[];
  axiosOptions?: AxiosRequestConfig;
}

export interface DeleteObjectRequest {
  objectId: string;
  versionId?: string;
}

export interface GetObjectRequest {
  objectId: string;
  versionId?: string;
}

export interface DownloadObjectRequest extends GetObjectRequest {
  filename: string;
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

export interface DeleteSubjectGroupRequest {
  sub: string;
  groupId: number;
}

export interface ListGroupsRequest {
  initiative: Initiative;
}

export interface ListPermissionsRequest {
  initiative: Initiative;
  groupName: GroupName;
}

export interface GetPeachSummaryRequest {
  permitTrackings: PermitTracking[];
}

export interface ListIdirUsersRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
}
