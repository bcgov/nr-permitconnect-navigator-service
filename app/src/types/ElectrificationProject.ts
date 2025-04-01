import { IStamps } from '../interfaces/IStamps';

export type ElectrificationProject = {
  electrificationProjectId: string; // Primary key
  activityId: string;
  assignedUserId?: string;
  submittedAt: string;
  projectName?: string;
  projectDescription?: string;
  companyNameRegistered?: string;
  projectType?: string;
  bcHydroNumber?: string;
  submissionType?: string;
} & Partial<IStamps>;
