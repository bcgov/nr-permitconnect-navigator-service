import type { MaybeUndefined } from '@/types/util';

export interface OrgBookOption {
  registeredId: MaybeUndefined<string>;
  registeredName: string;
}

export interface SearchOrgBookRequest {
  query: string;
}

export interface SearchOrgBookResponse {
  total: number;
  first_index: number;
  last_index: number;
  results: {
    type: string;
    sub_type: string;
    value: string;
    topic_source_id: string;
    topic_type: string;
    credential_type: string;
    credential_id: string;
    score: number;
  }[];
}
