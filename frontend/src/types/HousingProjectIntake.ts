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
    registeredName?: string;
    registeredId?: string;
  };
  contact: Contact;
  draftId?: string;
  housing: {
    singleFamilySelected?: boolean;
    multiFamilySelected?: boolean;
    otherSelected?: boolean;
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
  location: {
    geomarkUrl?: string;
    latitude?: number;
    locality?: string;
    longitude?: number;
    ltsaPidLookup?: string;
    naturalDisaster: BasicResponse;
    projectLocation: string;
    projectLocationDescription?: string;
    province?: string;
  };
  permits: {
    appliedPermits?: Partial<Permit>[];
    hasAppliedProvincialPermits: BasicResponse;
    investigatePermits?: Partial<Permit>[];
  };
}
