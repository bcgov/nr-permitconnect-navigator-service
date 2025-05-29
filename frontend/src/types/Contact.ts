import type { IStamps } from '@/interfaces';
import type { ActivityContact } from '@/types';

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
  activityContact?: ActivityContact[];
} & Partial<IStamps>;
