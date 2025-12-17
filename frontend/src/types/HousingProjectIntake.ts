import type { Contact } from './Contact';
import type { Permit } from './Permit';

export type HousingProjectIntake = {
  basic?: {
    consentToFeedback?: boolean;
    projectApplicantType?: string;
    isDevelopedInBc?: string;
    registeredId?: string;
    registeredName?: string;
  };

  housing?: {
    projectName?: string;
    projectDescription?: string;
    singleFamilyUnits?: string;
    multiFamilyUnits?: string;
    otherUnitsDescription?: string;
    otherUnits?: string;
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

  location?: {
    naturalDisaster?: string;
    projectLocation?: string;
    projectLocationDescription?: string;
    ltsaPidLookup?: string;
    latitude?: number;
    longitude?: number;
    streetAddress?: string;
    locality?: string;
    province?: string;
    geomarkUrl: string;
  };

  permits?: {
    hasAppliedProvincialPermits?: string;
  };

  appliedPermits?: Array<Permit>;

  investigatePermits?: Array<Permit>;

  contacts: Array<Contact>;
};
