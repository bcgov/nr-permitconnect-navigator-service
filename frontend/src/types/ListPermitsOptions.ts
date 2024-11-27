import type { IStamps } from '@/interfaces';

export type ListPermitsOptions = {
  activityId?: string;
  includeNotes?: boolean;
} & Partial<IStamps>;
