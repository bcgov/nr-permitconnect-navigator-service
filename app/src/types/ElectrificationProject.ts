import { IStamps } from '../interfaces/IStamps';

import type { Contact } from './Contact';
import type { User } from './User';

export type ElectrificationProject = {
  electrificationProjectId: string; // Primary key
  activityId: string;
  assignedUserId: string | null;
  submittedAt: string;
  contacts: Array<Contact>;
  user: User | null;
} & Partial<IStamps>;
