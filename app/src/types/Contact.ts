import { IStamps } from '../interfaces/IStamps';
import { ActivityContact } from './ActivityContact';

export type Contact = {
  contactId: string; // Primary Key
  userId: string | null;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  email: string | null;
  contactPreference: string | null;
  contactApplicantRelationship: string | null;
  activityContact?: Array<ActivityContact>;
} & Partial<IStamps>;
