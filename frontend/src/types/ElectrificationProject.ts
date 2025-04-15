import type { IProject } from '../interfaces/IProject';

export type ElectrificationProject = {
  electrificationProjectId: string; // Primary key
  projectType?: string;
  bcHydroNumber?: string;
} & IProject;
