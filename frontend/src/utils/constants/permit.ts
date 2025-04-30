import { PermitAuthorizationStatus, PermitNeeded, PermitStatus } from '@/utils/enums/permit';

export const PERMIT_AUTHORIZATION_STATUS_LIST = [
  PermitAuthorizationStatus.ISSUED,
  PermitAuthorizationStatus.PENDING,
  PermitAuthorizationStatus.IN_REVIEW,
  PermitAuthorizationStatus.DENIED,
  PermitAuthorizationStatus.CANCELLED,
  PermitAuthorizationStatus.WITHDRAWN,
  PermitAuthorizationStatus.ABANDONED,
  PermitAuthorizationStatus.NONE
];

export const PERMIT_NEEDED_LIST = [PermitNeeded.YES, PermitNeeded.UNDER_INVESTIGATION, PermitNeeded.NO];

export const PERMIT_STATUS_LIST = [
  PermitStatus.NEW,
  PermitStatus.APPLIED,
  PermitStatus.COMPLETED,
  PermitStatus.TECHNICAL_REVIEW,
  PermitStatus.PENDING
];
