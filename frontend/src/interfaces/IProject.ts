import type { IStamps } from '@/interfaces';
import type { Activity } from '../types/Activity';
import type { Contact } from '../types/Contact';
import type { User } from '../types/User';
import type { ApplicationStatus } from '@/utils/enums/projectCommon';

export type IProject = {
  projectId: string;
  activityId: string;
  submittedAt: string;
  assignedUserId?: string;
  intakeStatus: string;
  applicationStatus: ApplicationStatus;

  companyNameRegistered: string;
  hasRelatedEnquiry: boolean;
  queuePriority: number;
  submissionType: string;
  projectName: string;
  projectDescription: string;
  multiPermitsNeeded: string;
  astNotes: string;
  atsClientId: number | null;
  atsEnquiryId: string | null;
  addedToAts: boolean;
  aaiUpdated: boolean;

  // Joined
  activity?: Activity;
  contacts: Array<Contact>;
  user?: User;
} & Partial<IStamps>;
