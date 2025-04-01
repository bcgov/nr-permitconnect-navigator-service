import { Contact } from './Contact';

export type ElectrificationProjectIntake = {
  contacts?: Array<Contact>;
  draftId?: string;
  project: {
    activityId?: string;
    projectName?: string;
    projectDescription?: string;
    companyNameRegistered?: string;
    projectType?: string;
    bcHydroNumber?: string;
    submissionType?: string;
  };
};
