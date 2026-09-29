export const PeachIntegratedSystem = {
  ATS: 'ITSM-5314',
  TANTALIS: 'ITSM-6072',
  WMA: 'ITSM-6197',
  VFCBC: 'ITSM-6117'
} as const;
export type PeachIntegratedSystem = (typeof PeachIntegratedSystem)[keyof typeof PeachIntegratedSystem];

export const PeachTerminatedStage = {
  REJECTED: 'REJECTED',
  WITHDRAWN: 'WITHDRAWN'
} as const;
export type PeachTerminatedStage = (typeof PeachTerminatedStage)[keyof typeof PeachTerminatedStage];

export const PermitNeeded = {
  YES: 'Yes',
  UNDER_INVESTIGATION: 'Under investigation',
  NO: 'No'
} as const;
export type PermitNeeded = (typeof PermitNeeded)[keyof typeof PermitNeeded];

export const PermitPhase = {
  APPLICATION: 'Application'
} as const;
export type PermitPhase = (typeof PermitPhase)[keyof typeof PermitPhase];
