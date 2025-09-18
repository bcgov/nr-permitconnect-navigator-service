import type { IStamps } from '@/interfaces';
import type { PermitNote } from './PermitNote';
import type { PermitTracking } from './PermitTracking';
import type { PermitType } from './PermitType';
import type { PermitStage, PermitState } from '@/utils/enums/permit';

export type Permit = {
  permitId: string; // Primary Key
  activityId: string;
  adjudicationDate?: string;
  issuedPermitId?: string;
  needed: string;
  permitNote: Array<PermitNote>;
  permitTracking: Array<PermitTracking>;
  permitType: PermitType;
  permitTypeId: number;
  stage: PermitStage;
  state: PermitState;
  statusLastChanged?: string;
  statusLastVerified?: string;
  submittedDate?: string;
} & Partial<IStamps>;
