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
  contactPhoneNumber: string;
  contactFirstName: string;
  contactLastName: string;
  financiallySupported: boolean;
  intakeStatus: string;
  isBCHousingSupported: boolean;
  isIndigenousHousingProviderSupported: boolean;
  isNonProfitSupported: boolean;
  isHousingCooperativeSupported: boolean;
  latitude: string;
  longitude: string;
  naturalDisasterInd: boolean;
  projectName: string;
  companyNameRegistered: string;
  queuePriority: string;
  singleFamilyUnits: string;
  multiFamilyUnits: string;
  multiFamilyUnits1: string;
  streetAddress: string;
  guidance: boolean;
  statusRequest: boolean;
  inquiry: boolean;
  emergencyAssist: boolean;
  inapplicable: boolean;
  createdAt: string;
  createdBy: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  permitGrid: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dataGrid: any;
};
