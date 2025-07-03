// Authorization Status
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

export enum PermitAuthorizationStatusDescriptions {
  /* eslint-disable max-len */
  ISSUED = 'The application review process is completed and approved.',
  PENDING = 'The application is currently pending the applicant’s action in response to the reviewing authority’s request.',
  IN_REVIEW = 'The application is currently active.',
  DENIED = 'The application review process is completed, however, the reviewing authority has decided to not approve the application.',
  CANCELLED = 'The application has been cancelled by the reviewing authority.',
  WITHDRAWN = 'The application has been withdrawn by the applicant.',
  ABANDONED = 'The application has been abandoned by the applicant.',
  NONE = ''
  /*eslint-enable max-len */
}

export enum PermitNeeded {
  YES = 'Yes',
  UNDER_INVESTIGATION = 'Under investigation',
  NO = 'No'
}

// Status - Application Stage
export enum PermitStatus {
  NEW = 'Pre-submission',
  APPLIED = 'Application submission',
  COMPLETED = 'Post-decision',
  TECHNICAL_REVIEW = 'Technical review',
  PENDING = 'Pending decision'
}
