import { User } from './User';
import { IStamps } from '../interfaces/IStamps';

export type ChefsSubmissionForm = {
  submissionId: string;
  confirmationId: string;
  submittedAt: string;
  submittedBy: string;
  locationPIDs: string | null;
  contactName: string | null;
  contactPhoneNumber: string | null;
  contactEmail: string | null;
  projectName: string | null;
  singleFamilyUnits: string | null;
  streetAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  queuePriority: number | null;
  relatedPermits: string | null;
  astNotes: string | null;
  astUpdated: boolean | null;
  addedToATS: boolean | null;
  atsClientNumber: string | null;
  ltsaCompleted: boolean | null;
  naturalDisaster: boolean | null;
  financiallySupported: boolean | null;
  financiallySupportedBC: boolean | null;
  financiallySupportedIndigenous: boolean | null;
  financiallySupportedNonProfit: boolean | null;
  financiallySupportedHousingCoop: boolean | null;
  waitingOn: string | null;
  bringForwardDate: string | null;
  notes: string | null;
  user: User | null; // assigned to
  intakeStatus: string | null;
  applicationStatus: string | null;
} & Partial<IStamps>;
