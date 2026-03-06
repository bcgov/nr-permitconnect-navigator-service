import type { IStamps } from '@/interfaces';

export type Draft<T> = {
  draftId: string; // Primary key
  activityId: string;
  draftCode: string;
  data: T;
} & IStamps;
