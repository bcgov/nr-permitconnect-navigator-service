import type { Action, BasicResponse, GroupName, Initiative, Resource } from '@/utils/enums/application';
import type { ActivityContact, Permit } from './resources';
import type { Permit } from './resources';
import type { SsoIdirUserAttributes } from '../oidc';
import type { ContactPreference, ProjectRelationship } from '@/utils/enums/projectCommon';

export interface BringForward {
  activityId: string;
  enquiryId?: string;
  noteId: string;
  electrificationProjectId?: string;
  escalateToDirector?: boolean;
  escalateToSupervisor?: boolean;
  generalProjectId?: string;
  housingProjectId?: string;
  title: string;
  projectName?: string;
  bringForwardDate: string;
  createdByFullName?: string;
}

export interface Code {
  code: string;
  display: string;
  definition?: string;
  active: boolean;
}

export interface Group {
  groupId: number;
  initiativeCode?: string;
  initiativeId: string;
  name: GroupName;
  label?: string;
}

export interface Permission {
  group: GroupName;
  initiative: Initiative;
  resource: Resource;
  action: Action;
}

export interface SearchPermitsResponse {
  permits: Permit[];
  totalRecords: number;
}

export interface SearchIdirUsersResponse {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  attributes: SsoIdirUserAttributes;
}

export interface Statistics {
  total_submissions: number;
  total_submissions_between: number;
  total_submissions_monthyear: number;
  total_submissions_assignedto: number;
  intake_submitted: number;
  intake_assigned: number;
  intake_completed: number;
  multi_permits_needed: number;
  state_new: number;
  state_inprogress: number;
  state_delayed: number;
  state_completed: number;
  supported_bc: number;
  supported_indigenous: number;
  supported_non_profit: number;
  supported_housing_coop: number;
  queue_1: number;
  queue_2: number;
  queue_3: number;
  escalation: number;
  general_enquiry: number;
  guidance: number;
  inapplicable: number;
  status_request: number;
}

export interface ReportingResponse {
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

export interface PutActivityContactResponse {
  updated: ActivityContact;
  demoted: ActivityContact | undefined;
}
