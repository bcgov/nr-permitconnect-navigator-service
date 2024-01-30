// Enums that represent general app-wide values

// Which way to display a button that can appear in multiple modes
export const enum BUTTON_MODE {
  BUTTON = 'BUTTON',
  ICON = 'ICON'
}

/**
 * CHEFS form statuses
 */
export const enum APPLICATION_STATUS_LIST {
  NEW = 'New',
  IN_PROGRESS = 'In Progress',
  DELAYED = 'Delayed',
  COMPLETED = 'Completed'
}

export const enum INTAKE_STATUS_LIST {
  SUBMITTED = 'Submitted',
  ASSIGNED = 'Assigned',
  COMPLETED = 'Completed'
}

/**
 * Permit statuses
 */
export const enum PERMIT_AUTHORIZATION_STATUS {
  ISSUED = 'Issued',
  DENIED = 'Denied',
  PENDING = 'Pending',
  IN_REVIEW = 'In Review',
  NONE = 'None'
}

export const enum PERMIT_NEEDED {
  YES = 'Yes',
  UNDER_INVESTIGATION = 'Under investigation',
  NO = 'No'
}

export const enum PERMIT_STATUS {
  NEW = 'New',
  APPLIED = 'Applied',
  COMPLETED = 'Completed'
}
