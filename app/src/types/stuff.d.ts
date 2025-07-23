import jwt from 'jsonwebtoken';

import { AuthType, GroupName, Initiative } from '../utils/enums/application';
import { ApplicationStatus, SubmissionType } from '../utils/enums/projectCommon';

import type { AccessRequest, Contact, Permit, User } from './models';
import type { IStamps } from '../interfaces/IStamps';
import { Prisma } from '@prisma/client';

type AddressResource = {
  '@type': string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  provinceCode: string;
  countryCode: string;
  postalCode: string | null;
  primaryPhone: string;
  email: string;
};

export type ATSClientResource = {
  '@type': string;
  address: AddressResource;
  firstName: string;
  surName: string;
  regionName: string;
  optOutOfBCStatSurveyInd: string;
  createdBy: string;
};

export type ATSEnquiryResource = {
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
};

export type ATSUserSearchParameters = {
  atsClientId?: string;
  email?: string;
  firstName: string;
  lastName: string;
  phone?: string;
};

export type BceidSearchParameters = {
  guid: string;
};

export type BringForward = {
  activityId: string;
  noteId: string;
  electrificationProjectId: string;
  housingProjectId: string;
  title: string;
  projectName: string | null;
  bringForwardDate: string;
  createdByFullName: string | null;
};

export type ChefsFormConfig = {
  form1: ChefsFormConfigData;
  form2: ChefsFormConfigData;
};

export type ChefsFormConfigData = {
  id: string;
  apiKey: string;
};

export type ChefsSubmissionExport = {
  form: {
    id: string;
    submissionId: string;
    confirmationId: string;
    formName: string;
    version: number;
    createdAt: string;
    fullName: string;
    username: string;
    email: string;
    status: string;
    assignee: string;
    assigneedEmail: string;
  };

  submissionId: string;
  confirmationId: string;
  contactEmail: string;
  contactPreference: string;
  projectName: string;
  projectDescription: string;
  contactPhoneNumber: string;
  contactFirstName: string;
  contactLastName: string;
  contactApplicantRelationship: string;
  financiallySupported: boolean;
  housingCoopName: string;
  IndigenousHousingProviderName: string;
  intakeStatus: string;
  isBCHousingSupported: string;
  isCompany: string;
  isCompanyRegistered: string;
  isIndigenousHousingProviderSupported: string;
  isNonProfitSupported: string;
  isHousingCooperativeSupported: string;
  nonProfitHousingSocietyName: string;
  parcelID: string;
  latitude: number;
  locality: string;
  longitude: number;
  naturalDisasterInd: boolean;
  otherProjectType: string;
  companyName: string;
  companyNameRegistered: string;
  province: string;
  queuePriority: string;
  rentalUnits: string;
  singleFamilyUnits: string;
  multiFamilyUnits: string;
  multiFamilyUnits1: string;
  isRentalUnit: string;
  addressType: string;
  streetAddress: string;
  previousPermits: string;
  createdAt: string;
  createdBy: string;

  /* eslint-disable @typescript-eslint/no-explicit-any */
  // No clue what format the CHEFS permits might be delivered in
  permitGrid: any;
  dataGrid: any;
  /* eslint-enable @typescript-eslint/no-explicit-any */
};

export type ContactSearchParameters = {
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
};

export type CurrentAuthorization = {
  attributes: Array<string>;
  groups: Array<Group>;
};

export type CurrentContext = {
  authType?: AuthType;
  bearerToken?: string;
  initiative?: Initiative;
  tokenPayload?: jwt.JwtPayload;
  userId?: string;
};

export type ElectrificationProjectIntake = {
  contacts?: Array<Contact>;
  draftId?: string;
  project: {
    activityId?: string;
    projectName: string | null;
    projectDescription: string | null;
    companyNameRegistered: string | null;
    projectType: string | null;
    bcHydroNumber: string | null;
    submissionType?: string;
  };
};

export type ElectrificationProjectSearchParameters = {
  activityId?: Array<string>;
  createdBy?: Array<string>;
  electrificationProjectId?: Array<string>;
  projectType?: Array<string>;
  projectCategory?: Array<string>;
  intakeStatus?: Array<string>;
  includeUser?: boolean;
};

export type Email = {
  bcc?: Array<string>;
  bodyType: string;
  body: string;
  cc?: Array<string>;
  delayTS?: number;
  encoding?: string;
  from: string;
  priority?: string;
  subject: string;
  to: Array<string>;
  tag?: string;
  attachments?: Array<EmailAttachment>;
};

export type EmailAttachment = {
  content: string;
  contentType: string;
  encoding: string;
  filename: string;
};

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

export type EnquirySearchParameters = {
  activityId?: Array<string>;
  createdBy?: Array<string>;
  enquiryId?: Array<string>;
  intakeStatus?: Array<string>;
  includeUser?: boolean;
};

export type Group = {
  groupId: number;
  initiativeCode: string;
  initiativeId: string;
  name: GroupName;
  label?: string;
} & Partial<IStamps>;

export type HousingProjectIntake = {
  activityId?: string;
  draftId?: string;
  submittedAt?: string;
  applicationStatus?: ApplicationStatus;
  submissionType?: SubmissionType;

  basic?: {
    consentToFeedback?: boolean;
    projectApplicantType?: string | null;
    isDevelopedInBc?: string | null;
    registeredName?: string;
  };

  housing?: {
    projectName?: string;
    projectDescription?: string;
    singleFamilyUnits?: string;
    multiFamilyUnits?: string;
    otherUnitsDescription?: string;
    otherUnits?: string | null;
    hasRentalUnits?: string | null;
    financiallySupportedBc?: string | null;
    financiallySupportedIndigenous?: string | null;
    financiallySupportedNonProfit?: string | null;
    financiallySupportedHousingCoop?: string | null;
    rentalUnits?: string;
    indigenousDescription?: string;
    nonProfitDescription?: string;
    housingCoopDescription?: string;
  };

  location?: {
    naturalDisaster?: string;
    projectLocation?: string;
    projectLocationDescription?: string;
    geomarkUrl?: string | null;
    geoJson: Prisma.JsonValue;
    ltsaPIDLookup?: string;
    latitude?: number | null;
    longitude?: number | null;
    streetAddress?: string;
    locality?: string;
    province?: string;
  };

  permits?: {
    hasAppliedProvincialPermits?: string | null;
  };

  appliedPermits?: Permit[];
  investigatePermits?: Permit[];
  contacts?: Contact[];
};

export type HousingProjectSearchParameters = {
  activityId?: Array<string>;
  createdBy?: Array<string>;
  housingProjectId?: Array<string>;
  submissionType?: Array<string>;
  intakeStatus?: Array<string>;
  includeUser?: boolean;
};

export type IdirSearchParameters = {
  firstName: string;
  lastName: string;
  email: string;
};

export type IdpAttributes = {
  identityKey: string;
  idp: string;
  name: string;
  username: string;
};

export type ListPermitsOptions = {
  activityId?: string;
  includeNotes?: boolean;
} & Partial<IStamps>;

export type StatisticsFilters = {
  dateFrom: string;
  dateTo: string;
  monthYear: string;
  userId: string;
};

export type UserAccessRequest = {
  accessRequest?: AccessRequest;
} & User;

export type UserSearchParameters = {
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
};
