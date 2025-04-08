import { Prisma } from '@prisma/client';

import { IStamps } from '../interfaces/IStamps';

import type { Contact } from './Contact';
import type { User } from './User';

export type Submission = {
  submissionId: string; // Primary key
  activityId: string;
  assignedUserId: string | null;
  submittedAt: string;
  submittedBy: string;
  locationPIDs: string | null;
  companyNameRegistered: string | null;
  consentToFeedback: boolean;
  geoJSON: Prisma.JsonValue;
  geomarkUrl: string | null;
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
  atsClientId: number | null;
  ltsaCompleted: boolean;
  bcOnlineCompleted: boolean;
  naturalDisaster: string;
  financiallySupported: boolean;
  financiallySupportedBC: string | null;
  financiallySupportedIndigenous: string | null;
  financiallySupportedNonProfit: string | null;
  financiallySupportedHousingCoop: string | null;
  aaiUpdated: boolean;
  waitingOn: string | null;
  intakeStatus: string | null;
  applicationStatus: string | null;
  projectApplicantType: string | null;
  isDevelopedInBC: string | null;
  multiFamilyUnits: string | null;
  otherUnits: string | null;
  otherUnitsDescription: string | null;
  rentalUnits: string | null;
  projectLocation: string | null;
  projectLocationDescription: string | null;
  locality: string | null;
  province: string | null;
  hasAppliedProvincialPermits: string | null;
  indigenousDescription: string | null;
  nonProfitDescription: string | null;
  housingCoopDescription: string | null;
  submissionType: string | null;
  relatedEnquiries: string | null;
  contacts: Array<Contact>;
  user: User | null;
} & Partial<IStamps>;
