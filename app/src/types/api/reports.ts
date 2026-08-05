import type { ParsedQs } from 'qs';

export interface ElectrificationProjectStatistics {
  total_submissions: number;
  total_submissions_between: number;
  total_submissions_monthyear: number;
  total_submissions_assignedto: number;
  state_new: number;
  state_inprogress: number;
  state_delayed: number;
  state_completed: number;
  queue_1: number;
  queue_2: number;
  queue_3: number;
  escalation: number;
  general_enquiry: number;
  guidance: number;
  inapplicable: number;
  status_request: number;
  multi_permits_needed: number;
}

export interface GeneralProjectStatistics {
  total_submissions: number;
  total_submissions_between: number;
  total_submissions_monthyear: number;
  total_submissions_assignedto: number;
  state_new: number;
  state_inprogress: number;
  state_delayed: number;
  state_completed: number;
  queue_1: number;
  queue_2: number;
  queue_3: number;
  escalation: number;
  general_enquiry: number;
  guidance: number;
  inapplicable: number;
  status_request: number;
  multi_permits_needed: number;
}

export interface HousingProjectStatistics {
  total_submissions: number;
  total_submissions_between: number;
  total_submissions_monthyear: number;
  total_submissions_assignedto: number;
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
  multi_permits_needed: number;
}

export interface StatisticsFilters extends ParsedQs {
  dateFrom: string;
  dateTo: string;
  monthYear: string;
  userId: string;
}
