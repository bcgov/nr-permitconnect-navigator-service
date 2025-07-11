import { Prisma } from '@prisma/client';

import { IProject } from '../interfaces/IProject';

export type HousingProject = {
  housingProjectId: string; // Primary key
  submittedBy: string;
  locationPids: string | null;
  consentToFeedback: boolean;
  geoJson: Prisma.JsonValue;
  geomarkUrl: string | null;
  projectName: string | null;
  projectDescription: string | null;
  singleFamilyUnits: string | null;
  hasRentalUnits: string | null;
  streetAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  relatedPermits: string | null;
  astUpdated: boolean;
  ltsaCompleted: boolean;
  bcOnlineCompleted: boolean;
  naturalDisaster: string;
  financiallySupported: boolean;
  financiallySupportedBc: string | null;
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
} & IProject;
