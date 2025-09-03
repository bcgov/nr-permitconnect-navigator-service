import type { ActivityContact } from './ActivityContact';
import type { IStamps } from '@/interfaces';

export type Activity = {
  activityId: string;
  initiativeId: string;
  isDeleted: boolean;

  // Joined
  activityContact?: ActivityContact[];
} & Partial<IStamps>;
