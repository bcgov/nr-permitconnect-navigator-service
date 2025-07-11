import { Contact } from './Contact';

export type ElectrificationProjectIntake = {
  contacts?: Array<Contact>;
  draftId?: string;
  project: {
    activityId?: string;
    projectName: string | null;
    projectDescription: string | null;
    companyNameRegistered: string | null;
    projectType: string | null;
    bcHydroNumber: string | null;
    submissionType?: string;
  };
};
