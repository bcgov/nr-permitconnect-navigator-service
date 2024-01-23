import type { IStamps } from '@/interfaces';
import type { PermitType } from './PermitType';

export type Permit = {
  permitId: string; // Primary Key
  permitTypeId: number;
  submissionId: string;
  trackingId?: string;
  authStatus?: string;
  needed?: string;
  status?: string;
  submittedDate?: string;
  adjudicationDate?: string;
  permitType?: PermitType;
} & Partial<IStamps>;
