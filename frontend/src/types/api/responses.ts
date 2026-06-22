import type { BasicResponse } from '@/utils/enums/application';
import type { ActivityContact, Group } from './resources';
import type { SsoIdirUserAttributes } from '../oidc';
import type { ContactPreference, ProjectRelationship } from '@/utils/enums/projectCommon';
import type { CodeTableName } from '../common';
import type { PermitStage, PermitState, PiesOnHold } from '@/utils/enums/codeEnums';
import type { Code, Permission } from '../ui';

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
  decisionDate: string | null;
  decisionTime: string | null;
  statusLastChanged: string;
  statusLastChangedTime: string | null;
}

export interface GetProjectPermitDataResponse {
  project_name: string;
  consent_to_feedback?: BasicResponse;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  email: string | null;
  contact_preference: ContactPreference;
  contact_applicant_relationship: ProjectRelationship;
  activity_id: string;
  street_address: string;
  locality: string;
  latitude: number | null;
  longitude: number | null;
  location_pids: string | null;
  submission_type: string;
  application_status: string;
  issued_permit_id: string | null;
  tracking_id: string | null;
  state: string;
  needed: boolean;
  stage: string | null;
  submitted_date: string | null;
  submitted_time: string | null;
  decision_date: string | null;
  decision_time: string | null;
  status_last_verified: string | null;
  status_last_verified_time: string | null;
  status_last_changed: string | null;
  status_last_changed_time: string | null;
  agency: string | null;
  division: string | null;
  branch: string | null;
  permit_type: string | null;
  family: string | null;
  name: string | null;
  acronym: string | null;
  tracked_in_ats: boolean;
  source_system: string | null;
  source_system_acronym: string | null;
}

export interface ListIdirUsersResponse {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  attributes: SsoIdirUserAttributes;
}

export interface SearchPermitsResponse {
  permits: {
    permitId: string;
    activityId: string;
    permitTypeId: number;
    decisionDate: string | null;
    stage: string;
    state: string;
    statusLastChanged: string | null;
    submittedDate: string | null;
    permitType: {
      businessDomain: string;
      name: string;
    };
    project: {
      projectId: string;
      projectName: string | null;
      companyNameRegistered: string | null;
      streetAddress?: string | null;
      locality?: string | null;
      province?: string | null;
    } | null;
  }[];
  totalRecords: number;
}

export interface PutActivityContactResponse {
  updated: ActivityContact;
  demoted: ActivityContact | undefined;
}
