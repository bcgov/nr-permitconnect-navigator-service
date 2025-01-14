import { IStamps } from '../interfaces/IStamps.ts';

export type Activity = {
  activityId: string;
  initiativeId: string;
  isDeleted: boolean;
} & Partial<IStamps>;
