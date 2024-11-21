import type { IStamps } from '@/interfaces';
import type { PermitNote } from './PermitNote';

export type Permit = {
  permitId: string; // Primary Key
  permitTypeId: number;
  activityId: string;
  issuedPermitId?: string;
  trackingId?: string;
  authStatus?: string;
  needed?: string;
  status?: string;
  submittedDate?: string;
  adjudicationDate?: string;
  statusLastVerified?: string;
  permitNote?: Array<PermitNote>;
} & Partial<IStamps>;
