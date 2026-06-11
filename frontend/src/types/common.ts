import type { ElectrificationProject, GeneralProject, HousingProject } from './api/resources';
import type * as codeEnums from '@/utils/enums/codeEnums';

export type CodeTableName = keyof typeof codeEnums;
export interface KeyValuePair {
  key: string;
  value: string;
}
export interface PaginationOptions {
  skip?: number;
  sortField?: string;
  sortOrder?: number;
  take?: number;
}
export type Project = ElectrificationProject | GeneralProject | HousingProject;
export type UUID = string; // nosonar
