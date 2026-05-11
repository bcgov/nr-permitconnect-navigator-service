import { PermitStage, PermitState } from '@/utils/enums/codeEnums';
import { PermitNeeded } from '@/utils/enums/permit';

export const ONGOING_PERMIT_STATES: PermitState[] = [
  PermitState.ACCEPTED,
  PermitState.IN_PROGRESS,
  PermitState.INITIAL_REVIEW,
  PermitState.PENDING_APPLICANT_ACTION
];

export const PERMIT_NEEDED_LIST = [PermitNeeded.YES, PermitNeeded.UNDER_INVESTIGATION, PermitNeeded.NO];

export const PERMIT_STAGE_LIST: PermitStage[] = [
  PermitStage.PRE_SUBMISSION,
  PermitStage.APPLICATION_SUBMISSION,
  PermitStage.TECHNICAL_REVIEW,
  PermitStage.PENDING_DECISION,
  PermitStage.POST_DECISION
];

export const PERMIT_STATE_LIST: PermitState[] = [
  PermitState.INITIAL_REVIEW,
  PermitState.ACCEPTED,
  PermitState.PENDING_APPLICANT_ACTION,
  PermitState.IN_PROGRESS,
  PermitState.APPROVED,
  PermitState.ISSUED,
  PermitState.CANCELLED,
  PermitState.DENIED,
  PermitState.REJECTED,
  PermitState.WITHDRAWN,
  PermitState.NONE
];
