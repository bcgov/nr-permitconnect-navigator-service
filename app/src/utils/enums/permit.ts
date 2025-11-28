export enum PeachIntegratedSystem {
  ATS = 'ITSM-5314',
  TANTALIS = 'ITSM-6072',
  WMA = 'ITSM-6197',
  VFCBC = 'ITSM-6117'
}

export enum PeachTerminatedStage {
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN'
}

export enum PermitNeeded {
  YES = 'Yes',
  UNDER_INVESTIGATION = 'Under investigation',
  NO = 'No'
}

export enum PermitPhase {
  APPLICATION = 'Application'
}

export enum PermitStage {
  PRE_SUBMISSION = 'Pre-submission',
  APPLICATION_SUBMISSION = 'Application submission',
  TECHNICAL_REVIEW = 'Technical review',
  PENDING_DECISION = 'Pending decision',
  POST_DECISION = 'Post decision'
}

export enum PermitState {
  INITIAL_REVIEW = 'Initial review',
  PENDING_CLIENT = 'Pending client action',
  IN_PROGRESS = 'In progress',
  APPROVED = 'Approved',
  ISSUED = 'Issued',
  CANCELLED = 'Cancelled',
  DENIED = 'Denied',
  REJECTED = 'Rejected',
  WITHDRAWN = 'Withdrawn by client',
  NONE = 'None'
}
