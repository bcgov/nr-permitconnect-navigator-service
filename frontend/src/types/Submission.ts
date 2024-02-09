import type { User } from './User';

export type Submission = {
  formId?: string;
  submissionId: string;
  activityId: string;
  submittedAt: string;
  submittedBy: string;
  locationPIDs?: string;
  contactName?: string;
  contactPhoneNumber?: string;
  contactEmail?: string;
  projectName?: string;
  companyNameRegistered?: string;
  singleFamilyUnits?: string;
  streetAddress?: string;
  latitude?: number;
  longitude?: number;
  queuePriority?: string;
  relatedPermits?: string;
  astNotes?: string;
  astUpdated?: boolean;
  addedToATS?: boolean;
  atsClientNumber?: string;
  ltsaCompleted?: boolean;
  naturalDisaster?: boolean;
  financiallySupported?: boolean;
  financiallySupportedBC?: boolean;
  financiallySupportedIndigenous?: boolean;
  financiallySupportedNonProfit?: boolean;
  financiallySupportedHousingCoop?: boolean;
  aaiUpdated?: boolean;
  waitingOn?: string;
  bringForwardDate?: string;
  notes?: string;
  user?: User; // assigned to
  intakeStatus?: string;
  applicationStatus?: string;
};
