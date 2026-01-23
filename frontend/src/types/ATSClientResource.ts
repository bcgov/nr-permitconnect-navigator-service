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
  addressLine2: string | null;
  city: string;
  provinceCode: string;
  countryCode: string;
  postalCode: string | null;
  primaryPhone: string | null;
  secondaryPhone: string | null;
  fax: string | null;
  email: string | null;
  createdBy: string | null;
  createdDateTime: number | null;
  updatedBy: string | null;
  updatedDateTime: number | null;
}

export interface ATSClientResource {
  '@type': string | undefined;
  links: RelLink[] | undefined;
  clientId: number | undefined;
  address: ATSAddressResource;
  businessOrgCode: string | null;
  firstName: string;
  formattedAddress: string;
  surName: string;
  companyName: string | null;
  organizationNumber: string | null;
  confirmedIndicator: boolean;
  createdBy: string | undefined;
  createdDateTime: number | undefined;
  updatedBy: string | undefined;
  updatedDateTime: number | undefined;
  regionName: string | undefined;
  optOutOfBCStatSurveyInd: string | undefined;
}
