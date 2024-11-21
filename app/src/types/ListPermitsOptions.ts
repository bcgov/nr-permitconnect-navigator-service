import { IStamps } from '../interfaces/IStamps';

export type ListPermitsOptions = {
  activityId?: string;
  includeNotes?: boolean;
} & Partial<IStamps>;
