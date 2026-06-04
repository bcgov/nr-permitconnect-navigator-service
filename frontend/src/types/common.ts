import type * as codeEnums from '@/utils/enums/codeEnums';

import type { ElectrificationProject, GeneralProject, HousingProject } from './api/resources';

export interface PaginationOptions {
  skip?: number;
  sortField?: string;
  sortOrder?: number;
  take?: number;
}

export type CodeTableName = keyof typeof codeEnums;
export type Project = ElectrificationProject | GeneralProject | HousingProject;
export type UUID = string; // nosonar
