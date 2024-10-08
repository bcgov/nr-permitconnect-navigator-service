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
