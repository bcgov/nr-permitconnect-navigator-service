import type { PermitType } from './PermitType';

export type PermitForm = {
  permitId?: string;
  permitType?: PermitType;
  needed?: string;
  stage: string;
  agency?: string;
  trackingId?: string;
  businessDomain?: string;
  state: string;
  statusLastVerified?: Date;
  sourceSystem?: string;
  submittedDate?: Date;
  issuedPermitId?: string;
  adjudicationDate?: Date;
};
