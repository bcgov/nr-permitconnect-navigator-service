import { IProject } from '../interfaces/IProject';

export type ElectrificationProject = {
  electrificationProjectId: string; // Primary key
  projectType: string | null;
  projectCategory: string | null;
  bcHydroNumber: string | null;
  locationDescription: string | null;
  hasEpa: string | null;
  megawatts: string | null;
  bcEnvironmentAssessNeeded: string | null;
} & IProject;
