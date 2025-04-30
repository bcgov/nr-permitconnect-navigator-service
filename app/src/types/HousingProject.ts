import { Prisma } from '@prisma/client';

import { IProject } from '../interfaces/IProject';

import type { Contact } from '../types/Contact';
import type { User } from '../types/User';

export type HousingProject = {
  housingProjectId: string; // Primary key
  submittedBy: string;
  locationPIDs: string | null;
  consentToFeedback: boolean;
  geoJSON: Prisma.JsonValue;
  geomarkUrl: string | null;
  singleFamilyUnits: string | null;
  hasRentalUnits: string | null;
  streetAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  relatedPermits: string | null;
  astUpdated: boolean;
  addedToATS: boolean;
  ltsaCompleted: boolean;
  bcOnlineCompleted: boolean;
  naturalDisaster: string;
  financiallySupported: boolean;
  financiallySupportedBC: string | null;
  financiallySupportedIndigenous: string | null;
  financiallySupportedNonProfit: string | null;
  financiallySupportedHousingCoop: string | null;
  waitingOn: string | null;
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
  relatedEnquiries: string | null;

  // TODO: Can be removed and aligned with ElectrificationProject once schema mapping is completed
  // Just need things to remain working as they were for now...
  contacts: Array<Contact>;
  user: User | null;
} & IProject;
