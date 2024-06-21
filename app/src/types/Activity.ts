import { IStamps } from '../interfaces/IStamps';

export type Activity = {
  activityId: string;
  initiativeId: string;
  isDeleted: boolean;
} & Partial<IStamps>;
