import { IStamps } from '../interfaces/IStamps';
import { Contact } from './Contact';
import { EnquirySubmittedMethod } from '../utils/enums/housing';

import type { User } from './User';

export type Enquiry = {
  enquiryId: string; // Primary key
  activityId: string;
  addedToATS: boolean;
  assignedUserId: string | null;
  atsClientId: number | null;
  submissionType: string | null;
  submittedAt: string;
  submittedBy: string;
  relatedActivityId: string | null;
  enquiryDescription: string | null;
  intakeStatus: string | null;
  enquiryStatus: string | null;
  waitingOn: string | null;
  contacts: Array<Contact>;
  submittedMethod: EnquirySubmittedMethod;
  user: User | null;
} & Partial<IStamps>;
