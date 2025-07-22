import type { IStamps } from '@/interfaces';
import type { PermitNote } from './PermitNote';
import type { PermitTracking } from './PermitTracking';
import type { PermitType } from './PermitType';

export type Permit = {
  permitId: string; // Primary Key
  activityId: string;
  adjudicationDate?: string;
  authStatus?: string;
  issuedPermitId?: string;
  needed?: string;
  permitNote: Array<PermitNote>;
  permitTracking: Array<PermitTracking>;
  permitType: PermitType;
  permitTypeId: number;
  status?: string;
  statusLastVerified?: string;
  submittedDate?: string;
} & Partial<IStamps>;
