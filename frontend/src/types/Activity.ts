import type { IStamps } from '@/interfaces';

export type Activity = {
  activityId: string;
  initiativeId: string;
  isDeleted: boolean;
} & Partial<IStamps>;
