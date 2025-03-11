import type { IStamps } from '@/interfaces';

export type ActivityContact = {
  activityId: string;
  contactId: string;
} & Partial<IStamps>;
