import { ApplicationStatus, SubmissionType } from '../utils/enums/housing';

export type EnquiryIntake = {
  activityId?: string;
  enquiryId?: string;
  submittedAt?: string;
  enquiryStatus?: ApplicationStatus;
  enquiryType?: SubmissionType;
  submit?: boolean;

  applicant?: {
    contactFirstName?: string;
    contactLastName?: string;
    contactPhoneNumber?: string;
    contactEmail?: string;
    contactApplicantRelationship?: string;
    contactPreference?: string;
  };

  basic?: {
    enquiryType?: string;
    isRelated?: string;
    relatedActivityId?: string;
    enquiryDescription?: string;
    applyForPermitConnect: string;
  };
};
