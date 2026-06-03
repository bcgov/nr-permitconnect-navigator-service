import type { MaybeUndefined, Nullable } from '../../util';

export interface RelLink {
  '@type': string;
  rel: string;
  href: string;
  method: string;
}

export interface ATSAddressResource {
  '@type': string;
  links: RelLink[];
  addressId: number;
  addressLine1: string;
  addressLine2: Nullable<string>;
  city: string;
  provinceCode: string;
  countryCode: string;
  postalCode: Nullable<string>;
  primaryPhone: Nullable<string>;
  secondaryPhone: Nullable<string>;
  fax: Nullable<string>;
  email: Nullable<string>;
  createdBy: Nullable<string>;
  createdDateTime: number | null;
  updatedBy: Nullable<string>;
  updatedDateTime: number | null;
}

export interface ATSClientResource {
  '@type': MaybeUndefined<string>;
  links: RelLink[] | undefined;
  clientId: MaybeUndefined<number>;
  address: ATSAddressResource;
  businessOrgCode: Nullable<string>;
  firstName: string;
  formattedAddress: string;
  surName: string;
  companyName: Nullable<string>;
  organizationNumber: Nullable<string>;
  confirmedIndicator: boolean;
  createdBy: MaybeUndefined<string>;
  createdDateTime: MaybeUndefined<number>;
  updatedBy: MaybeUndefined<string>;
  updatedDateTime: MaybeUndefined<number>;
  regionName: MaybeUndefined<string>;
  optOutOfBCStatSurveyInd: MaybeUndefined<string>;
}

export interface ATSEnquiryResource {
  '@type': string;
  clientId: number;
  contactFirstName: string;
  notes: string;
  contactSurname: string;
  regionName: string;
  createdBy?: string;
  subRegionalOffice: string;
  enquiryTypeCodes: string[];
  enquiryMethodCodes: string[];
  enquiryPartnerAgencies: string[];
  enquiryFileNumbers: string[];
}

export interface ATSUserSearchParameters {
  clientId?: string | number | null;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}
