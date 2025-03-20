import { Contact } from './Contact';

export type ElectrificationProjectIntake = {
  activityId?: string;
  draftId?: string;
  submittedAt?: string;

  contacts?: Array<Contact>;
};
