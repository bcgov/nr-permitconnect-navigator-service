import { PermitNeeded, PermitStage, PermitState } from '../enums/permit';

export const PERMIT_NEEDED_LIST = [PermitNeeded.YES, PermitNeeded.UNDER_INVESTIGATION, PermitNeeded.NO];

export const PERMIT_STAGE_LIST = [
  PermitStage.PRE_SUBMISSION,
  PermitStage.APPLICATION_SUBMISSION,
  PermitStage.TECHNICAL_REVIEW,
  PermitStage.PENDING_DECISION,
  PermitStage.POST_DECISION
];

export const PERMIT_STATE_LIST = [
  PermitState.INITIAL_REVIEW,
  PermitState.PENDING_CLIENT,
  PermitState.IN_PROGRESS,
  PermitState.APPROVED,
  PermitState.ISSUED,
  PermitState.CANCELLED,
  PermitState.DENIED,
  PermitState.REJECTED,
  PermitState.WITHDRAWN,
  PermitState.NONE
];
