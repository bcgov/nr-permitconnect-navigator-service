import { IStamps } from '../interfaces/IStamps';

export type Permit = {
  permitId: string; // Primary Key
  permitTypeId: number;
  activityId: string;
  issuedPermitId: string | null;
  trackingId: string | null;
  authStatus: string | null;
  needed: string | null;
  status: string | null;
  submittedDate: string | null;
  adjudicationDate: string | null;
  statusLastVerified: string | null;
} & Partial<IStamps>;
