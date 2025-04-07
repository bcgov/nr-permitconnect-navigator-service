import type { IStamps } from '@/interfaces';
import type { Contact } from '../types/Contact';
import type { User } from '../types/User';
import type { ApplicationStatus } from '@/utils/enums/housing';

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

  streetAddress: string;

  // Joined
  contacts: Array<Contact>;
  user?: User;
} & Partial<IStamps>;
