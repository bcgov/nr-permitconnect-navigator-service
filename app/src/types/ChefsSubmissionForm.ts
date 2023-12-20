import { User } from './User';
import { YRN } from './YRN';
import { IStamps } from '../interfaces/IStamps';

export type ChefsSubmissionForm = {
  submissionId: string;
  confirmationId: string;
  contactEmail: string | null;
  contactPhoneNumber: string | null;
  contactFirstName: string | null;
  contactLastName: string | null;
  intakeStatus: string | null;
  projectName: string | null;
  queuePriority: number | null;
  singleFamilyUnits: string | null;
  streetAddress: string | null;
  atsClientNumber: string | null;
  addedToATS: YRN;
  financiallySupported: YRN;
  applicationStatus: string | null;
  relatedPermits: string | null;
  updatedAai: YRN;
  waitingOn: string | null;
  submittedAt: string;
  submittedBy: string;
  bringForwardDate: string | null;
  notes: string | null;
  user: User | null;
} & Partial<IStamps>;
