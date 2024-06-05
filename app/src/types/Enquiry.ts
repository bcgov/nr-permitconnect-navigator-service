import { IStamps } from '../interfaces/IStamps';

import type { User } from './User';

export type Enquiry = {
  enquiryId: string; // Primary key
  activityId: string;
  assignedUserId: string | null;
  submittedAt: string;
  submittedBy: string;
  contactFirstName: string | null;
  contactLastName: string | null;
  contactPhoneNumber: string | null;
  contactEmail: string | null;
  contactPreference: string | null;
  contactApplicantRelationship: string | null;
  isRelated: string | null;
  relatedActivityId: string | null;
  enquiryDescription: string | null;
  applyForPermitConnect: string | null;
  intakeStatus: string | null;
  user: User | null;
} & Partial<IStamps>;
