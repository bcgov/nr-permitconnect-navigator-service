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
