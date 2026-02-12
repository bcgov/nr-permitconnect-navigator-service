import type { IStamps } from '@/interfaces';
import type { Activity } from '@/types/Activity';
import type { Contact } from '@/types/Contact';
import type { User } from '@/types/User';
import type { ApplicationStatus, SubmissionType } from '@/utils/enums/projectCommon';

export interface IProject extends IStamps {
  projectId: string;
  activityId: string;
  submittedAt: string;
  assignedUserId?: string;
  applicationStatus: ApplicationStatus;

  companyIdRegistered: string;
  companyNameRegistered: string;
  hasRelatedEnquiry: boolean;
  queuePriority: number;
  submissionType: SubmissionType;
  projectName: string;
  projectDescription: string;
  multiPermitsNeeded: string;
  astNotes: string;
  atsClientId: number | null;
  atsEnquiryId: string | null;
  addedToAts: boolean;
  aaiUpdated: boolean;
  roadmapNote: string;

  // Joined
  activity?: Activity;
  contacts: Contact[];
  user?: User;
}
