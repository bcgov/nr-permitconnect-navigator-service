import type { Nullable } from '../../util';

export interface RelLink {
  '@type': string;
  rel: string;
  href: string;
  method: string;
}

export interface AtsAddressResource {
  '@type': string;
  links: RelLink[];
  addressId: number;
  addressLine1: Nullable<string>;
  addressLine2: Nullable<string>;
  city: Nullable<string>;
  provinceCode: Nullable<string>;
  countryCode: Nullable<string>;
  postalCode: Nullable<string>;
  primaryPhone: Nullable<string>;
  secondaryPhone: Nullable<string>;
  fax: Nullable<string>;
  email: Nullable<string>;
  createdBy: Nullable<string>;
  createdDateTime: Nullable<number>;
  updatedBy: Nullable<string>;
  updatedDateTime: number | null;
}

export interface AtsClientsResource {
  '@type': string;
  links: RelLink[];
  pageNumber: number;
  pageRowCount: number;
  totalRowCount: number;
  totalPageCount: number;
  clients: AtsClientResource[];
}

export interface AtsClientResource {
  '@type': string;
  links: RelLink[];
  clientId: number;
  address: AtsAddressResource;
  businessOrgCode: Nullable<string>;
  firstName: string;
  formattedAddress: string;
  surName: string;
  companyName: Nullable<string>;
  organizationNumber: Nullable<string>;
  confirmedIndicator: boolean;
  createdBy: Nullable<string>;
  createdDateTime: Nullable<number>;
  updatedBy: Nullable<string>;
  updatedDateTime: Nullable<number>;
  regionName: Nullable<string>;
  optOutOfBCStatSurveyInd: Nullable<string>;
}

export interface AtsEnquiryResource {
  '@type': string;
  enquiryId?: number;
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

export interface SearchAtsUsersRequest {
  clientId?: string | number | null;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}
