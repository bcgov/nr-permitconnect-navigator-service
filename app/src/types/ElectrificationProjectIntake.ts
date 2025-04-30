import { Contact } from './Contact';
import { ProjectTypeT } from '../utils/enums/electrification';

export type ElectrificationProjectIntake = {
  contacts?: Array<Contact>;
  draftId?: string;
  project: {
    activityId?: string;
    projectName?: string;
    projectDescription?: string;
    companyNameRegistered?: string;
    projectType?: ProjectTypeT;
    bcHydroNumber?: string;
    submissionType?: string;
  };
};
