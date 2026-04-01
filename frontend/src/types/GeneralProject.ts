import type { GeoJSON } from 'geojson';
import type { IProject } from '@/interfaces/IProject';
import type { Area, BusinessArea, ProjectApplicant, Region } from '@/utils/enums/projectCommon';

export type GeneralProject = {
  generalProjectId: string;
  projectNumber?: string;
  relatedEnquiries: string;
  projectApplicantType: ProjectApplicant;
  geoJson?: GeoJSON;
  projectLocation: string;
  projectLocationDescription?: string | null;
  locality?: string | null;
  province?: string | null;
  locationPids?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  streetAddress?: string | null;
  geomarkUrl?: string | null;
  naturalDisaster: boolean;
  hasAppliedProvincialPermits: boolean;
  activityType: string;
  isRegisteredInBc: boolean;
  region?: Region | null;
  area?: Area | null;
  businessArea?: BusinessArea | null;
} & IProject;
