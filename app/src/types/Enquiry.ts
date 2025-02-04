import { IStamps } from '../interfaces/IStamps';
import { Contact } from './Contact';
import type { User } from './User';

export type Enquiry = {
  enquiryId: string; // Primary key
  activityId: string;
  addedToAts: boolean;
  assignedUserId: string | null;
  atsClientNumber: string | null;
  enquiryType: string | null;
  submittedAt: string;
  submittedBy: string;
  relatedActivityId: string | null;
  enquiryDescription: string | null;
  intakeStatus: string | null;
  enquiryStatus: string | null;
  waitingOn: string | null;
  contacts: Array<Contact>;
  user: User | null;
} & Partial<IStamps>;
