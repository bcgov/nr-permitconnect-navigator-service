import type { ProjectApplicant } from '@/utils/enums/projectCommon';
import type { Contact } from './Contact';
import type { Permit } from './Permit';
import type { BasicResponse } from '@/utils/enums/application';

export interface GeneralProjectIntake {
  activityId?: string;
  basic: {
    projectApplicantType: ProjectApplicant;
    projectDescription: string;
    projectName: string;
    registeredId?: string;
    registeredName?: string;
  };
  contact: Contact;
  draftId?: string;
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
