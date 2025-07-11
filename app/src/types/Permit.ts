import { IStamps } from '../interfaces/IStamps';

export type Permit = {
  permitId: string; // Primary Key
  activityId: string;
  adjudicationDate: string | null;
  statusLastVerified: string | null;
} & Partial<IStamps>;
