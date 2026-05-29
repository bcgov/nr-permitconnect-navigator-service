import type { GeoJSON } from 'geojson';

import type { Maybe, Contact, Permit } from '@/types';
import type { BasicResponse } from '@/utils/enums/application';
import type { ProjectApplicant } from '@/utils/enums/projectCommon';

export interface ElectrificationProjectIntake {
  activityId?: string;
  basic: {
    projectDescription?: string;
    projectName: string;
    registeredId?: string | null;
    registeredName?: string | null;
  };
  contact: Contact;
  draftId?: string;
  project: {
    bcHydroNumber?: Maybe<string>;
    projectType: string; // TODO: can we get this enum type instead of string?
  };
}

export interface GeneralProjectIntake {
  activityId?: string;
  basic: {
    projectApplicantType: ProjectApplicant;
    projectDescription: string;
    projectName: string;
    projectNumber?: string;
    registeredId?: string | null;
    registeredName?: string | null;
  };
  contact: Contact;
  draftId?: string;
  location: {
    geomarkUrl?: string | null;
    geoJson?: GeoJSON;
    latitude?: number | null;
    locality?: string | null;
    longitude?: number | null;
    ltsaPidLookup?: string | null;
    naturalDisaster: BasicResponse;
    projectLocation: string;
    projectLocationDescription?: string | null;
    province?: string | null;
    streetAddress?: string | null;
  };
  permits: {
    appliedPermits?: Partial<Permit>[];
    hasAppliedProvincialPermits: BasicResponse;
    investigatePermits?: Partial<Permit>[];
  };
}

export interface HousingProjectIntake {
  activityId?: string;
  basic: {
    consentToFeedback: boolean;
    projectApplicantType: ProjectApplicant;
    projectDescription?: string;
    projectName: string;
    registeredName?: string | null;
    registeredId?: string | null;
  };
  contact: Contact;
  draftId?: string;
  housing: {
    singleFamilySelected?: boolean;
    multiFamilySelected?: boolean;
    otherSelected?: boolean;
    singleFamilyUnits?: string | null;
    multiFamilyUnits?: string | null;
    otherUnitsDescription?: string | null;
    otherUnits?: string | null;
    hasRentalUnits?: string;
    financiallySupportedBc?: string;
    financiallySupportedIndigenous?: string;
    financiallySupportedNonProfit?: string;
    financiallySupportedHousingCoop?: string;
    rentalUnits?: string;
    indigenousDescription?: string;
    nonProfitDescription?: string;
    housingCoopDescription?: string;
  };
  location: {
    geomarkUrl?: string | null;
    latitude?: number | null;
    locality?: string | null;
    longitude?: number | null;
    ltsaPidLookup?: string | null;
    naturalDisaster: BasicResponse;
    projectLocation: string;
    projectLocationDescription?: string | null;
    province?: string | null;
    streetAddress?: string | null;
  };
  permits: {
    appliedPermits?: Partial<Permit>[];
    hasAppliedProvincialPermits: BasicResponse;
    investigatePermits?: Partial<Permit>[];
  };
}
