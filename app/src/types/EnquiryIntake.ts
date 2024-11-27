import { Contact } from './Contact';
import { ApplicationStatus, SubmissionType } from '../utils/enums/housing';

export type EnquiryIntake = {
  activityId?: string;
  enquiryId?: string;
  submittedAt?: string;
  enquiryStatus?: ApplicationStatus;
  enquiryType?: SubmissionType;
  submit?: boolean;

  basic?: {
    enquiryType?: string;
    isRelated?: string;
    relatedActivityId?: string;
    enquiryDescription?: string;
    applyForPermitConnect: string;
  };

  contacts: Array<Contact>;
};
