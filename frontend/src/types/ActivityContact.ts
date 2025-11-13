import type { Contact } from './Contact';
import type { IStamps } from '@/interfaces';

export type ActivityContact = {
  activityId: string;
  contactId: string;
  role: string; // TODO: Enum

  // Joined
  contact?: Contact;
} & Partial<IStamps>;
