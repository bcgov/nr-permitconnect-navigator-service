import { IStamps } from '../interfaces/IStamps';

export interface IProject extends Partial<IStamps> {
  projectId?: string; // Auto populated from the projects PK - for front end use only
  activityId: string;
  assignedUserId?: string;
  submittedAt: string;
  intakeStatus: string;
  applicationStatus: string;
  projectName?: string;
  projectDescription?: string;
  submissionType?: string;
  companyNameRegistered?: string;
  aaiUpdated: boolean;
  astNotes?: string;
  queuePriority?: number;
  atsClientId?: number;
  atsEnquiryId?: number;
  addedToATS: boolean;
}
