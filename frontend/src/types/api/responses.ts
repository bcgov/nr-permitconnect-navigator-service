import type { ApiInitiative, Schema } from './openapi';
import type { Group } from './resources';
import type { SsoIdirUserAttributes } from '../oidc';
import type { CodeTableName } from '../common';
import type { PermitStage, PermitState, PiesOnHold } from '@/utils/enums/codeEnums';
import type { Code, Permission } from '../ui';

export interface CreateObjectResponse {
  id: string;
  path: string;
  public: boolean;
  active: boolean;
  bucketId: string;
  name: string;

  lastSyncedDate: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;

  length: number;
  mimeType: string;
  versionId: string;

  metadata: Record<string, string>;
  tags: Record<string, string>;

  $metadata: {
    httpStatusCode: number;
    extendedRequestId: string;
    attempts: number;
    totalRetryDelay: number;
  };

  ETag: string;
  Bucket: string;
  Key: string;
  Location: string;
  ServerSideEncryption: string;
  s3VersionId: string;
}

export interface GetAuthorizationContextResponse {
  groups: Group[];
  permissions: Permission[];
}

export type GetCodeTablesResponse = Record<CodeTableName, Code[]>;

export interface GetPeachSummaryResponse {
  stage: PermitStage;
  state: PermitState;
  onHoldCode?: PiesOnHold;
  submittedDate: string | null;
  submittedTime: string | null;
  consultationStartDate: string | null;
  consultationStartTime: string | null;
  consultationEndDate: string | null;
  consultationEndTime: string | null;
  decisionDate: string | null;
  decisionTime: string | null;
  statusLastChanged: string | null;
  statusLastChangedTime: string | null;
}

export interface ListIdirUsersResponse {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  attributes: SsoIdirUserAttributes;
}

export type ProjectStatistics = Schema<`${ApiInitiative}ProjectStatistics`>;

export type SearchPermitsResponse = Schema<'SearchPermitsResponse'>;

export type SearchProjectsResponse = Schema<`Search${ApiInitiative}ProjectsResponse`>;
