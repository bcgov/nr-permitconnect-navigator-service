import type { IStamps } from '@/interfaces';

export type Enquiry = {
  enquiryId: string;
  activityId: string;
  assignedUserId?: string;
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
} & Partial<IStamps>;
