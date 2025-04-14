import { Initiative } from '../utils/enums/application';

export type EnquirySearchParameters = {
  activityId?: Array<string>;
  createdBy?: Array<string>;
  enquiryId?: Array<string>;
  intakeStatus?: Array<string>;
  includeUser?: boolean;
  initiative?: Array<Initiative>;
};
