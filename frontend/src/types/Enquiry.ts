import type { Contact } from './Contact';
import type { IStamps } from '@/interfaces';

import { ApplicationStatus, EnquirySubmittedMethod } from '@/utils/enums/projectCommon';

export type Enquiry = {
  enquiryId: string;
  activityId: string;
  addedToATS: boolean;
  assignedUserId?: string;
  atsClientId: number | null;
  submissionType: string;
  submittedAt: string;
  submittedBy: string;
  relatedActivityId?: string;
  enquiryDescription?: string;
  intakeStatus: string;
  enquiryStatus: ApplicationStatus;
  waitingOn?: string;
  contacts: Array<Contact>;
  submittedMethod: EnquirySubmittedMethod;
} & Partial<IStamps>;
