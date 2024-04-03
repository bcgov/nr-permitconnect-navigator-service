import { IStamps } from '../interfaces/IStamps';

import type { User } from './User';

export type Submission = {
  submissionId: string; // Primary key
  activityId: string;
  assignedUserId: string | null;
  submittedAt: string;
  submittedBy: string;
  locationPIDs: string | null;
  companyNameRegistered: string | null;
  contactName: string | null;
  contactApplicantRelationship: string | null;
  contactPhoneNumber: string | null;
  contactEmail: string | null;
  contactPreference: string | null;
  projectName: string | null;
  projectDescription: string | null;
  singleFamilyUnits: string | null;
  isRentalUnit: string | null;
  streetAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  queuePriority: number | null;
  relatedPermits: string | null;
  astNotes: string | null;
  astUpdated: boolean;
  addedToATS: boolean;
  atsClientNumber: string | null;
  ltsaCompleted: boolean;
  bcOnlineCompleted: boolean;
  naturalDisaster: boolean;
  financiallySupported: boolean;
  financiallySupportedBC: boolean;
  financiallySupportedIndigenous: boolean;
  financiallySupportedNonProfit: boolean;
  financiallySupportedHousingCoop: boolean;
  aaiUpdated: boolean;
  waitingOn: string | null;
  intakeStatus: string | null;
  applicationStatus: string | null;
  guidance: boolean;
  statusRequest: boolean;
  inquiry: boolean;
  emergencyAssist: boolean;
  inapplicable: boolean;
  user: User | null;
} & Partial<IStamps>;
