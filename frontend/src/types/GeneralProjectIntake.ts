import type { ProjectApplicant } from '@/utils/enums/housing';
import type { Contact } from './Contact';
import type { Permit } from './Permit';
import type { BasicResponse } from '@/utils/enums/application';

export interface GeneralProjectIntake {
  basic: {
    consentToFeedback: boolean;
    projectApplicantType: ProjectApplicant;
    registeredId?: string;
    registeredName?: string;
  };

  general: {
    projectName: string;
    projectDescription: string;
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
