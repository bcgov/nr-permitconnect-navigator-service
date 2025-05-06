import type { IStamps } from '@/interfaces';

export type Contact = {
  bceidBusinessName?: string;
  contactId: string;
  userId?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  contactPreference?: string;
  contactApplicantRelationship?: string;
} & Partial<IStamps>;
