import { IStamps } from '../interfaces/IStamps';

export type ActivityContact = {
  activityId: string;
  contactId: string;
} & Partial<IStamps>;
