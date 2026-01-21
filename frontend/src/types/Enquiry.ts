import { ApplicationStatus, EnquirySubmittedMethod, SubmissionType } from '@/utils/enums/projectCommon';

import type { Activity } from './Activity';
import type { Contact } from './Contact';
import type { IStamps } from '@/interfaces';

interface EnquiryBase extends IStamps {
  addedToAts: boolean;
  assignedUserId?: string;
  atsClientId: number | null;
  atsEnquiryId: string | null;
  submissionType: SubmissionType;
  submittedAt: string;
  submittedBy: string;
  relatedActivityId?: string;
  enquiryDescription?: string;
  enquiryStatus: ApplicationStatus;
  submittedMethod: EnquirySubmittedMethod;
}

export interface Enquiry extends EnquiryBase {
  activity?: Activity;
  activityId: string;
  enquiryId: string;
}

export interface EnquiryArgs extends Partial<EnquiryBase> {
  contact: Contact;
}
