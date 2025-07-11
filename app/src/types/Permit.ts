import { IStamps } from '../interfaces/IStamps';
import { PermitNote } from './PermitNote';
import { PermitType } from './PermitType';
import { PermitTracking } from './PermitTracking';

export type Permit = {
  permitId: string; // Primary Key
  activityId: string;
  adjudicationDate: string | null;
  authStatus: string | null;
  issuedPermitId: string | null;
  needed: string | null;
  permitNote?: Array<PermitNote>;
  permitTracking?: Array<PermitTracking> | null;
  permitType: PermitType | null;
  permitTypeId: number;
  status: string | null;
  statusLastVerified: string | null;
  submittedDate: string | null;
} & Partial<IStamps>;
