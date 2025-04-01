import { Contact } from './Contact';
import { ApplicationStatus, SubmissionType } from '../utils/enums/projectCommon';

export type EnquiryIntake = {
  activityId?: string;
  enquiryId?: string;
  submittedAt?: string;
  enquiryStatus?: ApplicationStatus;
  submissionType?: SubmissionType;
  submit?: boolean;

  basic?: {
    submissionType?: string;
    relatedActivityId?: string;
    enquiryDescription?: string;
  };

  contacts: Array<Contact>;
};
