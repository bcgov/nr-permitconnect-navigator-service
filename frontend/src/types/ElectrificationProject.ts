import type { Contact } from './Contact';
import type { IStamps } from '@/interfaces';
import type { User } from './User';

export type ElectrificationProject = {
  activityId: string;
  electrificationProjectId: string;
  submittedAt: string;
  assignedUserId?: string;
  contacts: Array<Contact>;
  user?: User;
} & Partial<IStamps>;
