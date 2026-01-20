import type { IStamps } from '@/interfaces';

export type Draft = {
  draftId: string; // Primary key
  activityId: string;
  draftCode: string;
  data: object;
} & IStamps;
