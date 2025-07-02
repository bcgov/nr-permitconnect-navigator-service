import type { AuthorizationType } from './AuthorizationType';

export type AuthorizationForm = {
  permitId?: string;
  authorizationType?: AuthorizationType;
  needed?: string;
  status?: string;
  agency?: string;
  permitNote?: string;
  trackingId?: string;
  businessDomain?: string;
  authStatus?: string;
  statusLastVerified?: Date;
  sourceSystem?: string;
  submittedDate?: Date;
  issuedPermitId?: string;
  adjudicationDate?: Date;
};
