import type { Maybe } from 'yup';
import type { Contact } from './Contact';

export interface ElectrificationProjectIntake {
  activityId?: string;
  basic: {
    projectDescription?: string;
    projectName: string;
    registeredId?: string;
    registeredName?: string;
  };
  contact: Contact;
  draftId?: string;
  project: {
    bcHydroNumber?: Maybe<string>;
    projectType: string; // TODO: can we get this enum type instead of string?
  };
}
