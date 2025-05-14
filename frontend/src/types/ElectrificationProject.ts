import type { IProject } from '../interfaces/IProject';

export type ElectrificationProject = {
  electrificationProjectId: string; // Primary key
  projectType?: string;
  projectCategory?: string;
  bcHydroNumber?: string;
  locationDescription?: string;
  hasEpa?: string;
  megawatts?: string;
  bcEnvironmentAssessNeeded?: string;
} & IProject;
