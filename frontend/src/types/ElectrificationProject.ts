import type { IProject } from '@/interfaces/IProject';

export type ElectrificationProject = {
  electrificationProjectId: string; // Primary key
  projectType?: string;
  projectCategory?: string | null;
  bcHydroNumber?: string | null;
  locationDescription?: string | null;
  hasEpa?: string | null;
  megawatts?: number | null;
  bcEnvironmentAssessNeeded?: string | null;
} & IProject;
