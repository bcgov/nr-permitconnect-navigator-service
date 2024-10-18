type AddressResource = {
  '@type': 'AddressResource';
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
  '@type': 'ClientResource';
  address: AddressResource;
  firstName: string;
  surName: string;
  regionName: string;
  optOutOfBCStatSurveyInd: 'YES' | 'NO';
  createdBy: string;
};
