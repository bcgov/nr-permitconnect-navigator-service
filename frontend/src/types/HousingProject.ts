import type { IProject } from '../interfaces/IProject';

export type HousingProject = {
  housingProjectId: string;
  relatedEnquiries: string;
  consentToFeedback?: boolean;
  isDevelopedInBC: string;
  geoJSON?: any;
  projectLocationDescription: string;
  singleFamilyUnits: string;
  multiFamilyUnits: string;
  otherUnitsDescription: string;
  otherUnits: string;
  hasRentalUnits: string;
  rentalUnits: string;
  financiallySupportedBC: string;
  financiallySupportedIndigenous: string;
  indigenousDescription: string;
  financiallySupportedNonProfit: string;
  nonProfitDescription: string;
  financiallySupportedHousingCoop: string;
  housingCoopDescription: string;
  locality: string;
  province: string;
  locationPIDs: string;
  latitude: number;
  longitude: number;
  geomarkUrl: string;
  naturalDisaster: string;
  addedToATS: boolean;
  atsClientId: string | null;
  ltsaCompleted: boolean;
  bcOnlineCompleted: boolean;
  aaiUpdated: boolean;
  astNotes: string;
  waitingOn?: string;
} & IProject;
