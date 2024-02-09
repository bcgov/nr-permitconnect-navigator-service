import { IStamps } from '../interfaces/IStamps';
import type { PermitType } from './PermitType';
import type { Submission } from './Submission';

export type Permit = {
  permitId: string; // Primary Key
  permitTypeId: number;
  submissionId: string;
  issuedPermitId: string | null;
  trackingId: string | null;
  authStatus: string | null;
  needed: string | null;
  status: string | null;
  submittedDate: string | null;
  adjudicationDate: string | null;
  permitType: PermitType;
  submission: Submission;
} & Partial<IStamps>;
