import type { PermitType } from './PermitType';

export type PermitForm = {
  permitId?: string;
  permitType?: PermitType;
  needed?: string;
  status?: string;
  agency?: string;
  trackingId?: string;
  businessDomain?: string;
  authStatus?: string;
  statusLastVerified?: Date;
  sourceSystem?: string;
  submittedDate?: Date;
  issuedPermitId?: string;
  adjudicationDate?: Date;
};
