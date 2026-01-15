export enum PermitNeeded {
  YES = 'Yes',
  UNDER_INVESTIGATION = 'Under investigation',
  NO = 'No'
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

export enum PermitStateDescriptions {
  INITIAL_REVIEW = 'Your application has been received and is being reviewed for completeness.',
  PENDING_CLIENT = 'The application is currently pending the applicant’s action in response to the reviewing authority’s request.',
  IN_PROGRESS = 'The application is currently active.',
  APPROVED = 'The application review process is completed and approved.',
  ISSUED = 'Your permit has been issued.',
  CANCELLED = 'The application has been cancelled by the reviewing authority.',
  DENIED = 'The application review process is completed, however, the reviewing authority has decided to not approve the application.',
  REJECTED = 'Your application has been rejected by the reviewing authority.',
  WITHDRAWN = 'The application has been withdrawn by the applicant.',
  NONE = ''
}
