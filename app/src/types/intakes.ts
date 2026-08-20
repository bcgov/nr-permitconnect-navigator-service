import type { Prisma } from '@prisma/client';
import type { Contact, ContactBase, Permit } from './api/resources.ts';
import type { Maybe } from './utils.ts';
import type { ApplicationStatus, SubmissionType } from '#src/utils/enums/projectCommon';

export interface ElectrificationProjectIntake {
  activityId?: string;
  basic: {
    projectDescription: string | null;
    projectName: string;
    registeredId?: string;
    registeredName?: string;
  };
  contact: Contact;
  draftId: Maybe<string>;
  project: {
    bcHydroNumber?: string;
    projectType?: string;
  };
}

export interface EnquiryIntake {
  activityId?: string;
  enquiryId?: string;
  submittedAt?: string;
  enquiryStatus?: ApplicationStatus;
  submissionType?: SubmissionType;
  submit?: boolean;
  relatedActivityId?: string;
  enquiryDescription?: string;
  contact: ContactBase;
}

export interface GeneralProjectIntake {
  activityId: string | null;
  draftId: Maybe<string>;
  submittedAt: string | null;
  applicationStatus?: ApplicationStatus;
  submissionType?: SubmissionType;

  basic: {
    projectApplicantType: string | null;
    projectName: string | null;
    projectNumber: string | null;
    projectDescription: string;
    registeredId: string | null;
    registeredName: string | null;
  };

  location: {
    naturalDisaster: string;
    projectLocation: string;
    projectLocationDescription: string;
    geomarkUrl: string | null;
    geoJson: Prisma.JsonValue;
    ltsaPidLookup: string | null;
    locationPids: string | null;
    latitude: number | null;
    longitude: number | null;
    streetAddress: string;
    locality: string;
    province: string;
  };

  permits: {
    appliedPermits: Permit[];
    hasAppliedProvincialPermits?: string | null;
    investigatePermits: Permit[];
  };

  contact: Contact;
}

export interface HousingProjectIntake {
  activityId: string | null;
  basic: {
    consentToFeedback: boolean;
    projectApplicantType: string | null;
    projectName: string;
    projectDescription: string;
    registeredId: string | null;
    registeredName: string | null;
  };
  contact: ContactBase;
  draftId: Maybe<string>;
  housing: {
    singleFamilyUnits: string;
    multiFamilyUnits: string;
    otherUnitsDescription: string | null;
    otherUnits: string;
    hasRentalUnits: string;
    financiallySupportedBc: string;
    financiallySupportedIndigenous: string;
    financiallySupportedNonProfit: string;
    financiallySupportedHousingCoop: string;
    rentalUnits: string | null;
    indigenousDescription: string | null;
    nonProfitDescription: string | null;
    housingCoopDescription: string | null;
  };
  location: {
    geomarkUrl: string | null;
    geoJson: Prisma.JsonValue;
    latitude: number | null;
    locality: string;
    longitude: number | null;
    ltsaPidLookup: string | null;
    naturalDisaster: string;
    projectLocation: string;
    projectLocationDescription: string;
    province: string;
    streetAddress: string | null;
  };
  permits: {
    appliedPermits: Permit[];
    hasAppliedProvincialPermits?: string | null;
    investigatePermits: Permit[];
  };
}
