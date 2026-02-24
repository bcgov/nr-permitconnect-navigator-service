import type { ProjectApplicant } from '@/utils/enums/projectCommon';
import type { Contact } from './Contact';
import type { Permit } from './Permit';
import type { BasicResponse } from '@/utils/enums/application';

export interface HousingProjectIntake {
  basic: {
    consentToFeedback: boolean;
    projectApplicantType: ProjectApplicant;
    registeredId?: string;
    registeredName?: string;

    projectName: string;
    projectDescription?: string;
  };

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
    naturalDisaster: BasicResponse;
    projectLocation: string;
    projectLocationDescription?: string;
    ltsaPidLookup?: string;
    latitude?: number;
    longitude?: number;
    locality?: string;
    province?: string;
    geomarkUrl?: string;
  };

  permits: {
    hasAppliedProvincialPermits: BasicResponse;
  };

  appliedPermits?: Partial<Permit>[];
  investigatePermits?: Partial<Permit>[];

  contact: Contact;

  activityId?: string;
  draftId?: string;
}
