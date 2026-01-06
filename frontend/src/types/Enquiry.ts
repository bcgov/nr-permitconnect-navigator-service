import type { Contact } from './Contact';
import type { IStamps } from '@/interfaces';

import { ApplicationStatus, EnquirySubmittedMethod } from '@/utils/enums/projectCommon';

import type { Activity } from './Activity';

export type Enquiry = {
  enquiryId: string;
  activityId: string;
  addedToAts: boolean;
  assignedUserId?: string;
  atsClientId: number | null;
  atsEnquiryId: string | null;
  submissionType: string;
  submittedAt: string;
  submittedBy: string;
  relatedActivityId?: string;
  enquiryDescription?: string;
  enquiryStatus: ApplicationStatus;
  contacts: Array<Contact>;
  submittedMethod: EnquirySubmittedMethod;

  // Joined
  activity?: Activity;
} & Partial<IStamps>;
