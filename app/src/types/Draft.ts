import { IStamps } from '../interfaces/IStamps.ts';

export type Draft = {
  draftId: string; // Primary key
  activityId: string;
  draftCode: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
} & Partial<IStamps>;
