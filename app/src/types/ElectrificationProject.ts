import { IStamps } from '../interfaces/IStamps';

import type { Contact } from './Contact';
import type { User } from './User';

export type ElectrificationProject = {
  electrificationProjectId: string; // Primary key
  activityId: string;
  assignedUserId: string | null;
  submittedAt: string;
  projectName: string | null;
  projectDescription: string | null;
  companyNameRegistered: string | null;
  projectType: string | null;
  bcHydroNumber: string | null;
  submissionType: string | null;

  contacts: Array<Contact>;
  user: User | null;
} & Partial<IStamps>;
