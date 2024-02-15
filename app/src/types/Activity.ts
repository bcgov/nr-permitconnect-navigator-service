import { IStamps } from '../interfaces/IStamps';

export type Activity = {
  activityId: string;
  initiativeId: string;
} & Partial<IStamps>;
