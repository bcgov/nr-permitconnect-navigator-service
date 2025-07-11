import { IStamps } from '../interfaces/IStamps';

export type Contact = {
  bceidBusinessName?: string | null;
  contactId: string; // Primary Key
  userId: string | null;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  email: string | null;
  contactPreference: string | null;
  contactApplicantRelationship: string | null;
} & Partial<IStamps>;
