import type { IStamps } from '@/interfaces';
import type { Activity, Contact, User } from '@/types';
import type { ApplicationStatus, SubmissionType } from '@/utils/enums/projectCommon';

export interface IProject extends IStamps {
  projectId: string;
  activityId: string;
  submittedAt: string;
  assignedUserId?: string | null;
  applicationStatus: ApplicationStatus;

  companyIdRegistered?: string | null;
  companyNameRegistered?: string | null;
  hasRelatedEnquiry: boolean;
  queuePriority: number;
  submissionType: SubmissionType;
  projectName: string;
  projectDescription: string;
  multiPermitsNeeded: string;
  astNotes?: string | null;
  atsClientId: number | null;
  atsEnquiryId: number | null;
  addedToAts: boolean;
  aaiUpdated: boolean;

  // Joined
  activity?: Activity;
  contacts: Contact[];
  user?: User;
}
