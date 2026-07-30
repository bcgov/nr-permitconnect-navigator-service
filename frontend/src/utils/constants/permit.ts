import { PermitStage, PermitState } from '@/utils/enums/codeEnums';
import { PermitNeeded } from '@/utils/enums/permit';

export const ONGOING_PERMIT_STATES: PermitState[] = [
  PermitState.ACCEPTED,
  PermitState.IN_PROGRESS,
  PermitState.INITIAL_REVIEW,
  PermitState.PENDING_APPLICANT_ACTION
];

export const PERMIT_NEEDED_LIST = [PermitNeeded.YES, PermitNeeded.UNDER_INVESTIGATION, PermitNeeded.NO];

export const VALID_STATE_STAGES: Record<PermitState, PermitStage[]> = {
  [PermitState.NONE]: [PermitStage.PRE_SUBMISSION],
  [PermitState.INITIAL_REVIEW]: [PermitStage.APPLICATION_SUBMISSION, PermitStage.TECHNICAL_REVIEW],
  [PermitState.ACCEPTED]: [PermitStage.APPLICATION_SUBMISSION, PermitStage.TECHNICAL_REVIEW],
  [PermitState.IN_PROGRESS]: [
    PermitStage.APPLICATION_SUBMISSION,
    PermitStage.TECHNICAL_REVIEW,
    PermitStage.PENDING_DECISION
  ],
  [PermitState.PENDING_APPLICANT_ACTION]: [
    PermitStage.APPLICATION_SUBMISSION,
    PermitStage.TECHNICAL_REVIEW,
    PermitStage.PENDING_DECISION
  ],
  [PermitState.WITHDRAWN]: [
    PermitStage.APPLICATION_SUBMISSION,
    PermitStage.TECHNICAL_REVIEW,
    PermitStage.PENDING_DECISION,
    PermitStage.POST_DECISION
  ],
  [PermitState.CANCELLED]: [
    PermitStage.APPLICATION_SUBMISSION,
    PermitStage.TECHNICAL_REVIEW,
    PermitStage.PENDING_DECISION
  ],
  [PermitState.REJECTED]: [
    PermitStage.APPLICATION_SUBMISSION,
    PermitStage.TECHNICAL_REVIEW,
    PermitStage.PENDING_DECISION
  ],
  [PermitState.DENIED]: [PermitStage.POST_DECISION],
  [PermitState.APPROVED]: [PermitStage.POST_DECISION],
  [PermitState.ISSUED]: [PermitStage.POST_DECISION]
};
