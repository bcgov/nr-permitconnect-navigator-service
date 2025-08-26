import type { ActivityContact } from './ActivityContact';
import type { IStamps } from '@/interfaces';

export type Activity = {
  activityId: string;
  initiativeId: string;

  // Joined
  activityContact?: ActivityContact[];
} & Partial<IStamps>;
