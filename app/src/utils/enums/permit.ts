export enum PermitAuthorizationStatus {
  ISSUED = 'Approved',
  PENDING = 'Pending client action',
  IN_REVIEW = 'In progress',
  DENIED = 'Denied',
  CANCELLED = 'Cancelled',
  WITHDRAWN = 'Withdrawn',
  ABANDONED = 'Abandoned',
  NONE = 'None'
}

export enum PermitNeeded {
  YES = 'Yes',
  UNDER_INVESTIGATION = 'Under investigation',
  NO = 'No'
}

export enum PermitStatus {
  NEW = 'Pre-submission',
  APPLIED = 'Application submission',
  COMPLETED = 'Post-decision',
  TECHNICAL_REVIEW = 'Technical review',
  PENDING = 'Pending decision'
}
