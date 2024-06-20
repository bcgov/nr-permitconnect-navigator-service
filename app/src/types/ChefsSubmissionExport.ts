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
  intakeStatus: string;
  isBCHousingSupported: string;
  isIndigenousHousingProviderSupported: string;
  isNonProfitSupported: string;
  isHousingCooperativeSupported: string;
  parcelID: string;
  latitude: number;
  longitude: number;
  naturalDisasterInd: boolean;
  companyNameRegistered: string;
  queuePriority: string;
  singleFamilyUnits: string;
  multiFamilyUnits: string;
  multiFamilyUnits1: string;
  isRentalUnit: string;
  streetAddress: string;
  createdAt: string;
  createdBy: string;

  /* eslint-disable @typescript-eslint/no-explicit-any */
  // No clue what format the CHEFS permits might be delivered in
  permitGrid: any;
  dataGrid: any;
  /* eslint-enable @typescript-eslint/no-explicit-any */
};
