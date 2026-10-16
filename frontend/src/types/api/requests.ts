import type { PermitTracking } from './resources';
import type { KeyValuePair } from '../common';
import type { GroupName, Initiative } from '@/utils/enums/application';
import type { AxiosRequestConfig } from 'axios';

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
  permitTrackings: Partial<PermitTracking>[];
}

export interface ListIdirUsersRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
}
