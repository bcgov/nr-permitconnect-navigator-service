import type { IProject } from '../interfaces/IProject';
import type { ProjectCategory, ProjectType } from '@/utils/enums/electrification';

export type ElectrificationProject = {
  electrificationProjectId: string; // Primary key
  projectType?: ProjectType;
  projectCategory?: ProjectCategory;
  bcHydroNumber?: string;
  locationDescription?: string;
  hasEpa?: string;
  megawatts?: string;
  bcEnvironmentAssessNeeded?: string;
} & IProject;
