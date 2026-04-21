import type { ProjectApplicant } from '@/utils/enums/projectCommon';
import type { Contact } from './Contact';
import type { Permit } from './Permit';
import type { BasicResponse } from '@/utils/enums/application';

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
