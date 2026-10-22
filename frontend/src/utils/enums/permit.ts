export const PermitNeeded = {
  YES: 'Yes',
  UNDER_INVESTIGATION: 'Under investigation',
  NO: 'No'
} as const;

export type PermitNeeded = (typeof PermitNeeded)[keyof typeof PermitNeeded];
