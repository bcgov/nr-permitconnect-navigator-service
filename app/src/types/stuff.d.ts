import { Prisma } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { ParsedQs } from 'qs';

import { AuthType, GroupName, Initiative } from '../utils/enums/application.ts';
import { PermitStage, PermitState } from '../utils/enums/permit.ts';
import { ApplicationStatus, SubmissionType } from '../utils/enums/projectCommon.ts';

import type { AccessRequest, Contact, ElectrificationProject, HousingProject, Permit, User } from './models';
import type { IStamps } from '../interfaces/IStamps.ts';
import type { EmailTemplate } from '../utils/templates';

interface AddressResource {
  '@type': string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  provinceCode: string;
  countryCode: string;
  postalCode: string | null;
  primaryPhone: string;
  email: string;
}

export interface ATSClientResource {
  '@type': string;
  address: AddressResource;
  firstName: string;
  surName: string;
  regionName: string;
  optOutOfBCStatSurveyInd: string;
  createdBy: string;
}

export interface ATSEnquiryResource {
  '@type': string;
  clientId: number;
  contactFirstName: string;
  notes: string;
  contactSurname: string;
  regionName: string;
  createdBy: string;
  subRegionalOffice: string;
  enquiryTypeCodes: string[];
  enquiryMethodCodes: string[];
  enquiryPartnerAgencies: string[];
  enquiryFileNumbers: string[];
}

export interface ATSUserSearchParameters extends ParsedQs {
  clientId?: string | number | null;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface BceidSearchParameters extends ParsedQs {
  guid: string;
}

export interface BringForward {
  activityId: string;
  noteId: string;
  electrificationProjectId?: string;
  housingProjectId?: string;
  enquiryId?: string;
  title: string;
  projectName: string | null;
  bringForwardDate?: string;
  createdByFullName: string | null;
}

export interface ContactSearchParameters {
  contactApplicantRelationship?: string;
  contactPreference?: string;
  contactId?: string[];
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  userId?: string[];
  initiative?: Initiative;
  includeActivities?: boolean;
}

export interface CurrentAuthorization {
  attributes: string[];
  groups: Group[];
}

export interface CurrentContext {
  authType?: AuthType;
  bearerToken?: string;
  initiative?: Initiative;
  tokenPayload?: jwt.JwtPayload;
  userId?: string;
}

export interface ElectrificationProjectIntake {
  contact: Contact;
  draftId?: string;
  project: {
    activityId?: string;
    projectName: string | null;
    projectDescription: string | null;
    companyNameRegistered: string | null;
    companyIdRegistered: string | null;
    projectType: string | null;
    bcHydroNumber: string | null;
    submissionType?: string;
  };
}

export interface ElectrificationProjectSearchParameters {
  activityId?: string[];
  createdBy?: string[];
  electrificationProjectId?: string[];
  projectType?: string[];
  projectCategory?: string[];
  includeUser?: boolean;
}

export interface ElectrificationProjectStatistics {
  total_submissions: number;
  total_submissions_between: number;
  total_submissions_monthyear: number;
  total_submissions_assignedto: number;
  state_new: number;
  state_inprogress: number;
  state_delayed: number;
  state_completed: number;
  queue_1: number;
  queue_2: number;
  queue_3: number;
  escalation: number;
  general_enquiry: number;
  guidance: number;
  inapplicable: number;
  status_request: number;
  multi_permits_needed: number;
}

export interface Email {
  bcc?: string[];
  bodyType: string;
  body: string;
  cc?: string[];
  delayTS?: number;
  encoding?: string;
  from: string;
  priority?: string;
  subject: string;
  to: string[];
  tag?: string;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  content: string;
  contentType: string;
  encoding: string;
  filename: string;
}

export interface EnquiryIntake {
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

  contact: Contact;
}

export interface EnquirySearchParameters {
  activityId?: string[];
  createdBy?: string[];
  enquiryId?: string[];
  includeUser?: boolean;
}

export interface GeneralProjectIntake {
  activityId: string | null;
  draftId: string | null;
  submittedAt: string | null;
  applicationStatus?: ApplicationStatus;
  submissionType?: SubmissionType;

  basic: {
    consentToFeedback: boolean;
    projectApplicantType: string | null;
    projectName: string;
    projectDescription: string;
    registeredId: string | null;
    registeredName: string | null;
  };

  location: {
    naturalDisaster: string;
    projectLocation: string;
    projectLocationDescription: string;
    geomarkUrl: string | null;
    geoJson: Prisma.JsonValue;
    ltsaPidLookup: string | null;
    latitude: number | null;
    longitude: number | null;
    streetAddress: string;
    locality: string;
    province: string;
  };

  permits: {
    hasAppliedProvincialPermits?: string | null;
  };

  appliedPermits: Permit[];
  investigatePermits: Permit[];
  contact: Contact;
}

export interface GeneralProjectSearchParameters {
  activityId?: string[];
  createdBy?: string[];
  generalProjectId?: string[];
  submissionType?: string[];
  includeUser?: boolean;
}

export interface GeneralProjectStatistics {
  total_submissions: number;
  total_submissions_between: number;
  total_submissions_monthyear: number;
  total_submissions_assignedto: number;
  state_new: number;
  state_inprogress: number;
  state_delayed: number;
  state_completed: number;
  queue_1: number;
  queue_2: number;
  queue_3: number;
  escalation: number;
  general_enquiry: number;
  guidance: number;
  inapplicable: number;
  status_request: number;
  multi_permits_needed: number;
}

export interface Group extends Partial<IStamps> {
  groupId: number;
  initiativeCode: string;
  initiativeId: string;
  name: GroupName;
  label?: string;
}

export interface HousingProjectIntake {
  activityId: string | null;
  draftId: string | null;
  submittedAt: string | null;
  applicationStatus?: ApplicationStatus;
  submissionType?: SubmissionType;

  basic: {
    consentToFeedback: boolean;
    projectApplicantType: string | null;
    projectName: string;
    projectDescription: string;
    registeredId: string | null;
    registeredName: string | null;
  };

  housing: {
    singleFamilyUnits: string;
    multiFamilyUnits: string;
    otherUnitsDescription: string | null;
    otherUnits: string;
    hasRentalUnits: string;
    financiallySupportedBc: string;
    financiallySupportedIndigenous: string;
    financiallySupportedNonProfit: string;
    financiallySupportedHousingCoop: string;
    rentalUnits: string;
    indigenousDescription: string | null;
    nonProfitDescription: string | null;
    housingCoopDescription: string | null;
  };

  location: {
    naturalDisaster: string;
    projectLocation: string;
    projectLocationDescription: string;
    geomarkUrl: string | null;
    geoJson: Prisma.JsonValue;
    ltsaPidLookup: string | null;
    latitude: number | null;
    longitude: number | null;
    streetAddress: string;
    locality: string;
    province: string;
  };

  permits: {
    hasAppliedProvincialPermits?: string | null;
  };

  appliedPermits: Permit[];
  investigatePermits: Permit[];
  contact: Contact;
}

export interface HousingProjectSearchParameters {
  activityId?: string[];
  createdBy?: string[];
  housingProjectId?: string[];
  submissionType?: string[];
  includeUser?: boolean;
}

export interface HousingProjectStatistics {
  total_submissions: number;
  total_submissions_between: number;
  total_submissions_monthyear: number;
  total_submissions_assignedto: number;
  state_new: number;
  state_inprogress: number;
  state_delayed: number;
  state_completed: number;
  supported_bc: number;
  supported_indigenous: number;
  supported_non_profit: number;
  supported_housing_coop: number;
  queue_1: number;
  queue_2: number;
  queue_3: number;
  escalation: number;
  general_enquiry: number;
  guidance: number;
  inapplicable: number;
  status_request: number;
  multi_permits_needed: number;
}

export interface IdirSearchParameters extends ParsedQs {
  firstName: string;
  lastName: string;
  email: string;
}

export interface IdpAttributes {
  identityKey: string;
  idp: string;
  name: string;
  username: string;
}

export interface ListPermitsOptions extends Partial<IStamps> {
  activityId?: string;
  includeNotes?: boolean;
}

export interface PeachSummary {
  stage: PermitStage;
  state: PermitState;
  submittedDate: string | null;
  submittedTime: string | null;
  decisionDate: string | null;
  decisionTime: string | null;
  statusLastChanged: string;
  statusLastChangedTime: string | null;
}

export interface PermitSearchParams {
  permitId?: string[];
  activityId?: string[];
  permitTypeId?: number[];
  stage?: string[];
  state?: string[];
  sourceSystems?: string[];
  includePermitNotes?: boolean;
  includePermitTracking?: boolean;
  includePermitType?: boolean;
  onlyPeachIntegratedTrackings?: boolean;
}

export interface PermitUpdateEmailParams {
  permit: Permit;
  initiative: Initiative;
  dearName: string;
  projectId: string;
  toEmails: string[];
  emailTemplate: EmailTemplate;
}

export type Project = HousingProject | ElectrificationProject;

interface SplitDatetimeBase<T> {
  date: T;
  time: string | null;
}

export type DateTimeStrings = SplitDatetimeBase<string>;

export type NullableDateTimeStrings = SplitDatetimeBase<string | null>;

export interface StatisticsFilters extends ParsedQs {
  dateFrom: string;
  dateTo: string;
  monthYear: string;
  userId: string;
}

export interface UserAccessRequest extends User {
  accessRequest?: AccessRequest;
}

export interface UserSearchParameters {
  userId?: string[];
  idp?: string[];
  group?: GroupName[];
  sub?: string;
  email?: string;
  firstName?: string;
  fullName?: string;
  lastName?: string;
  active?: boolean;
  includeUserGroups?: boolean;
  initiative?: Initiative[];
}
