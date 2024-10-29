import type { IStamps } from '@/interfaces';

import { ApplicationStatus } from '@/utils/enums/housing';

export type Enquiry = {
  enquiryId: string;
  activityId: string;
  assignedUserId?: string;
  enquiryType: string;
  submittedAt: string;
  submittedBy: string;
  contactFirstName?: string;
  contactLastName?: string;
  contactPhoneNumber?: string;
  contactEmail?: string;
  contactPreference?: string;
  contactApplicantRelationship?: string;
  isRelated?: string;
  relatedActivityId?: string;
  enquiryDescription?: string;
  applyForPermitConnect?: string;
  intakeStatus: string;
  enquiryStatus: ApplicationStatus;
  waitingOn?: string;
} & Partial<IStamps>;
