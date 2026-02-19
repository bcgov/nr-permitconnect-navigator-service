import type { GeoJSON } from 'geojson';
import type { IProject } from '@/interfaces/IProject';
import type { ProjectApplicant } from '@/utils/enums/housing';

export type GeneralProject = {
  generalProjectId: string;
  relatedEnquiries: string;
  projectApplicantType: ProjectApplicant;
  consentToFeedback?: boolean;
  geoJson?: GeoJSON;
  projectLocation: string;
  projectLocationDescription: string;
  locality: string;
  province: string;
  locationPids: string;
  latitude: number;
  longitude: number;
  streetAddress: string;
  geomarkUrl: string;
  naturalDisaster: boolean;
  ltsaCompleted: boolean;
  bcOnlineCompleted: boolean;
  hasAppliedProvincialPermits: boolean;
} & IProject;
