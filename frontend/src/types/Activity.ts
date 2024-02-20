import type { IStamps } from '@/interfaces';

export type Activity = {
  activityId: string;
  initiativeId: string;
} & Partial<IStamps>;
