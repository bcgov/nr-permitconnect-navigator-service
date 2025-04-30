import { ProjectCategoryT, ProjectTypeT } from '../utils/enums/electrification';

export type ElectrificationProjectSearchParameters = {
  activityId?: Array<string>;
  createdBy?: Array<string>;
  electrificationProjectId?: Array<string>;
  projectType?: Array<ProjectTypeT>;
  projectCategory?: Array<ProjectCategoryT>;
  intakeStatus?: Array<string>;
  includeUser?: boolean;
  includeDeleted?: boolean;
};
