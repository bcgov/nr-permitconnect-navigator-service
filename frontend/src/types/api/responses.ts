import type { Action, GroupName, Initiative, Resource } from '@/utils/enums/application';
import type { Permit } from './resources';

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
