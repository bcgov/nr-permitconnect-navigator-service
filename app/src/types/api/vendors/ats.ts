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

export interface AtsClientResource {
  '@type': string;
  address: AddressResource;
  firstName: string;
  surName: string;
  regionName: string;
  optOutOfBCStatSurveyInd: string;
  createdBy: string;
}

export interface AtsEnquiryResource {
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
