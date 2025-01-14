import { IStamps } from '../interfaces/IStamps.ts';
import { Contact } from './Contact.ts';
import type { User } from './User.ts';

export type Enquiry = {
  enquiryId: string; // Primary key
  activityId: string;
  assignedUserId: string | null;
  enquiryType: string | null;
  submittedAt: string;
  submittedBy: string;
  isRelated: string | null;
  relatedActivityId: string | null;
  enquiryDescription: string | null;
  applyForPermitConnect: string | null;
  intakeStatus: string | null;
  enquiryStatus: string | null;
  waitingOn: string | null;
  contacts: Array<Contact>;
  user: User | null;
} & Partial<IStamps>;
