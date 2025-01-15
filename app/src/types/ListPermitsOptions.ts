import type { IStamps } from '../interfaces/IStamps.ts';

export type ListPermitsOptions = {
  activityId?: string;
  includeNotes?: boolean;
} & Partial<IStamps>;
