import type { Contact } from './Contact';
import type { IStamps } from '@/interfaces';

import { ApplicationStatus } from '@/utils/enums/housing';

export type Enquiry = {
  enquiryId: string;
  activityId: string;
  addedToATS: boolean;
  assignedUserId?: string;
  atsClientId: string | null;
  enquiryType: string;
  submittedAt: string;
  submittedBy: string;
  relatedActivityId?: string;
  enquiryDescription?: string;
  intakeStatus: string;
  enquiryStatus: ApplicationStatus;
  waitingOn?: string;
  contacts: Array<Contact>;
} & Partial<IStamps>;
