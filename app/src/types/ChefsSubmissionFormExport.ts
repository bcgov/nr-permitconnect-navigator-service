export type ChefsSubmissionFormExport = {
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
  // Additional form field data will be added
};
