import { Contact } from './Contact';
import { ApplicationStatus, SubmissionType } from '../utils/enums/projectCommon';

export type EnquiryIntake = {
  activityId?: string;
  enquiryId?: string;
  submittedAt?: string;
  enquiryStatus?: ApplicationStatus;
  enquiryType?: SubmissionType;
  submit?: boolean;

  basic?: {
    enquiryType?: string;
    relatedActivityId?: string;
    enquiryDescription?: string;
  };

  contacts: Array<Contact>;
};
