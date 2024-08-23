import type { IStamps } from '@/interfaces';
import type { User } from './User';

export type Submission = {
  activityId: string;
  submissionId: string;
  queuePriority: number;
  submissionType: string;
  submittedAt: string;
  relatedEnquiries: string;
  hasRelatedEnquiry: boolean;
  contactFirstName: string;
  contactLastName: string;
  companyNameRegistered: string;
  consentToFeedback?: boolean;
  isDevelopedInBC: string;
  contactApplicantRelationship: string;
  contactPreference: string;
  contactPhoneNumber: string;
  contactEmail: string;
  projectName: string;
  projectDescription: string;
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
  streetAddress: string;
  locality: string;
  province: string;
  locationPIDs: string;
  latitude: number;
  longitude: number;
  geomarkUrl: string;
  naturalDisaster: string;
  addedToATS: boolean;
  atsClientNumber?: string;
  ltsaCompleted: boolean;
  bcOnlineCompleted: boolean;
  aaiUpdated: boolean;
  astNotes: string;
  intakeStatus: string;
  assignedUserId?: string;
  applicationStatus: string;
  waitingOn?: string;
  user?: User;
} & Partial<IStamps>;
