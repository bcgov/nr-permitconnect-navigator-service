import type { Contact } from './Contact';
import type { IStamps } from '@/interfaces';

import { ApplicationStatus } from '@/utils/enums/housing';

export type Enquiry = {
  enquiryId: string;
  activityId: string;
  assignedUserId?: string;
  enquiryType: string;
  submittedAt: string;
  submittedBy: string;
  relatedActivityId?: string;
  enquiryDescription?: string;
  applyForPermitConnect?: string;
  intakeStatus: string;
  enquiryStatus: ApplicationStatus;
  waitingOn?: string;
  contacts: Array<Contact>;
} & Partial<IStamps>;
