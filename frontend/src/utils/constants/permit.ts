import { PermitState } from '@/utils/enums/codeEnums';
import { PermitNeeded } from '@/utils/enums/permit';

export const ONGOING_PERMIT_STATES: PermitState[] = [
  PermitState.ACCEPTED,
  PermitState.IN_PROGRESS,
  PermitState.INITIAL_REVIEW,
  PermitState.PENDING_APPLICANT_ACTION
];

export const PERMIT_NEEDED_LIST = [PermitNeeded.YES, PermitNeeded.UNDER_INVESTIGATION, PermitNeeded.NO];
