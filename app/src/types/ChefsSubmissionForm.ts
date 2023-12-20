import { YRN } from './YRN';
import { IStamps } from '../interfaces/IStamps';

export type ChefsSubmissionForm = {
  submissionId: string;
  assignedToUserId?: string;
  confirmationId: string;
  contactEmail?: string;
  contactPhoneNumber?: string;
  contactFirstName?: string;
  contactLastName?: string;
  intakeStatus?: string;
  projectName?: string;
  queuePriority?: string;
  singleFamilyUnits?: string;
  streetAddress?: string;
  atsClientNumber?: string;
  addedToATS: YRN;
  financiallySupported: YRN;
  applicationStatus?: string;
  relatedPermits?: string;
  updatedAai: YRN;
  waitingOn?: string;
  submittedAt: string;
  submittedBy: string;
  bringForwardDate?: string;
  notes?: string;
} & IStamps;
