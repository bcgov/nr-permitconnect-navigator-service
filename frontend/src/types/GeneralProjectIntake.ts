import type { GeoJSON } from 'geojson';
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
