import type { IStamps } from '@/interfaces';
import type { PermitNote } from './PermitNote';
import type { PermitTracking } from './PermitTracking';
import type { PermitType } from './PermitType';
import type { PermitStage, PermitState } from '@/utils/enums/permit';

interface PermitBase extends IStamps {
  activityId: string;
  issuedPermitId?: string | null;
  needed: string;
  permitNote?: PermitNote[];
  permitTracking?: PermitTracking[];
  permitType?: PermitType;
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
}

export interface Permit extends PermitBase {
  permitId: string;
}

export interface PermitArgs extends PermitBase {
  permitId?: string;
}
