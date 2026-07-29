import type { ElectrificationProject, GeneralProject, HousingProject } from './api/resources.ts';

interface SplitDatetimeBase<T> {
  date: T;
  time: string | null;
}

export type DateTimeStrings = SplitDatetimeBase<string>;

export type NullableDateTimeStrings = SplitDatetimeBase<string | null>;

export interface PaginationOptions {
  skip?: string;
  sortField?: string;
  sortOrder?: string;
  take?: string;
}

export type Project = ElectrificationProject | GeneralProject | HousingProject;

export type ProjectRepositoryKeys = 'electrificationProject' | 'generalProject' | 'housingProject';
