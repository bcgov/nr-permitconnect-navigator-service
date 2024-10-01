import { ApplicationStatus, SubmissionType } from '../utils/enums/housing';
import { Permit } from './Permit';

export type SubmissionIntake = {
  activityId?: string;
  submissionId?: string;
  submittedAt?: string;
  applicationStatus?: ApplicationStatus;
  submissionType?: SubmissionType;
  submit?: boolean;

  applicant?: {
    contactFirstName?: string;
    contactLastName?: string;
    contactPhoneNumber?: string;
    contactEmail?: string;
    contactApplicantRelationship?: string;
    contactPreference?: string;
  };

  basic?: {
    consentToFeedback?: boolean;
    isDevelopedByCompanyOrOrg?: string | null;
    isDevelopedInBC?: string | null;
    registeredName?: string;
  };

  housing?: {
    projectName?: string;
    projectDescription?: string;
    singleFamilyUnits?: string;
    multiFamilyUnits?: string;
    otherUnitsDescription?: string;
    otherUnits?: string | null;
    hasRentalUnits?: string | null;
    financiallySupportedBC?: string | null;
    financiallySupportedIndigenous?: string | null;
    financiallySupportedNonProfit?: string | null;
    financiallySupportedHousingCoop?: string | null;
    rentalUnits?: string;
    indigenousDescription?: string;
    nonProfitDescription?: string;
    housingCoopDescription?: string;
  };

  location?: {
    naturalDisaster?: string;
    projectLocation?: string;
    projectLocationDescription?: string;
    ltsaPIDLookup?: string;
    latitude?: number | null;
    longitude?: number | null;
    streetAddress?: string;
    locality?: string;
    province?: string;
  };

  permits?: {
    hasAppliedProvincialPermits?: string | null;
  };

  appliedPermits?: Array<Permit>;

  investigatePermits?: Array<Permit>;
};
