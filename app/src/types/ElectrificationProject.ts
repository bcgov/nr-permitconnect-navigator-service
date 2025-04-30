import { IProject } from '../interfaces/IProject';
import { ProjectCategoryT, ProjectTypeT } from '../utils/enums/electrification';

export type ElectrificationProject = {
  electrificationProjectId: string; // Primary key
  projectType?: ProjectTypeT;
  projectCategory?: ProjectCategoryT;
  bcHydroNumber?: string;
  locationDescription?: string;
  hasEpa?: string;
  megawatts?: string;
  bcEnvironmentAssessNeeded?: string;
} & IProject;
