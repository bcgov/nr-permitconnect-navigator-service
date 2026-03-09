import type { IStamps } from '@/interfaces';
import type { Contact } from '@/types';
import type { ActivityContactRole } from '@/utils/enums/projectCommon';

export type ActivityContact = {
  activityId: string;
  contactId: string;
  role: ActivityContactRole;

  // Joined
  contact?: Contact;
} & Partial<IStamps>;
