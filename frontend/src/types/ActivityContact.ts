import type { Contact } from './Contact';
import type { IStamps } from '@/interfaces';

export type ActivityContact = {
  activityId: string;
  contactId: string;

  // Joined
  contact?: Contact;
} & Partial<IStamps>;
