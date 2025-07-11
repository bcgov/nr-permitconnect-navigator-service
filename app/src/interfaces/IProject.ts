import { IStamps } from '../interfaces/IStamps';

export interface IProject extends IStamps {
  projectId?: string; // Auto populated from the projects PK - for front end use only
  activityId: string;
  assignedUserId: string | null;
  submittedAt: Date;
  intakeStatus: string | null;
  applicationStatus: string | null;
  projectName: string | null;
  projectDescription: string | null;
  submissionType: string | null;
  companyNameRegistered: string | null;
  aaiUpdated: boolean;
  astNotes: string | null;
  queuePriority: number | null;
  atsClientId: number | null;
  atsEnquiryId: number | null;
  addedToAts: boolean;
}
