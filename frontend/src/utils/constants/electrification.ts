import { objectToOptions } from '@/utils/utils';
import { ProjectCategory, ProjectType } from '@/utils/enums/electrification';

const PROJECT_CATEGORY_LABELS = {
  [ProjectCategory.EXISTING]: 'Existing Electrification project work',
  [ProjectCategory.IPP]: 'IPP (Independent Power Producer)',
  [ProjectCategory.NEW_CALL]: 'New Call for Power',
  [ProjectCategory.NEW_TRANSMISSION]: 'New Transmission line',
  [ProjectCategory.REMOTE_RENEWABLE]: 'Remote Community Renewable Project',
  [ProjectCategory.SUSTAINMENT]: 'Sustainment'
};

export const PROJECT_CATEGORY_LIST = Object.keys(ProjectCategory) as Array<keyof typeof ProjectCategory>;

export const PROJECT_CATEGORY_OPTIONS = objectToOptions(PROJECT_CATEGORY_LABELS);

const PROJECT_TYPE_LABELS = {
  [ProjectType.IPP_SOLAR]: 'IPP Solar',
  [ProjectType.IPP_WIND]: 'IPP Wind',
  [ProjectType.NCTL]: 'North Coast Transmission Line (NCTL)',
  [ProjectType.OTHER]: 'Other'
};

export const PROJECT_TYPE_LIST = Object.keys(ProjectType) as Array<keyof typeof ProjectType>;

export const PROJECT_TYPE_OPTIONS = objectToOptions(PROJECT_TYPE_LABELS);
