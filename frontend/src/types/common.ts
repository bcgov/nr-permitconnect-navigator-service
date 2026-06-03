import type { ElectrificationProject, GeneralProject, HousingProject } from './api/resources';

export interface PaginationOptions {
  skip?: number;
  sortField?: string;
  sortOrder?: number;
  take?: number;
}

export type Project = ElectrificationProject | GeneralProject | HousingProject;
