import type { IStamps } from '@/interfaces';
import type { PermitNote } from './PermitNote';
import type { PermitTracking } from './PermitTracking';
import type { PermitType } from './PermitType';
import type { PermitStage, PermitState } from '@/utils/enums/permit';

export type Permit = {
  permitId: string; // Primary Key
  activityId: string;
  issuedPermitId?: string;
  needed: string;
  permitNote: Array<PermitNote>;
  permitTracking: Array<PermitTracking>;
  permitType: PermitType;
  permitTypeId: number;
  stage: PermitStage;
  state: PermitState;
  submittedDate?: string | null;
  submittedTime?: string | null;
  statusLastChanged?: string | null;
  statusLastChangedTime?: string | null;
  statusLastVerified?: string | null;
  statusLastVerifiedTime?: string | null;
  decisionDate?: string | null;
  decisionTime?: string | null;
} & Partial<IStamps>;
