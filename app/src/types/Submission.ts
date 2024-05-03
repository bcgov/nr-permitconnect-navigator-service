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
  hasRentalUnits: string | null;
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
  financiallySupportedBC: string | null;
  financiallySupportedIndigenous: string | null;
  financiallySupportedNonProfit: string | null;
  financiallySupportedHousingCoop: string | null;
  aaiUpdated: boolean;
  waitingOn: string | null;
  intakeStatus: string | null;
  applicationStatus: string | null;
  guidance: boolean;
  statusRequest: boolean;
  inquiry: boolean;
  emergencyAssist: boolean;
  inapplicable: boolean;

  isDevelopedByCompanyOrOrg: string | null;
  isDevelopedInBC: string | null;
  multiFamilyUnits: string | null;
  otherUnits: string | null;
  otherUnitsDescription: string | null;
  rentalUnits: string | null;
  projectLocation: string | null;
  locality: string | null;
  province: string | null;
  hasAppliedProvincialPermits: string | null;
  checkProvincialPermits: string | null;
  indigenousDescription: string | null;
  nonProfitDescription: string | null;
  housingCoopDescription: string | null;

  user: User | null;
} & Partial<IStamps>;
