import { IStamps } from '../interfaces/IStamps';
import type { PermitType } from './PermitType';
import type { ChefsSubmissionForm } from './ChefsSubmissionForm';

export type Permit = {
  permitId: string; // Primary Key
  permitTypeId: number;
  submissionId: string;
  trackingId: string | null;
  authStatus: string | null;
  needed: string | null;
  status: string | null;
  submittedDate: string | null;
  adjudicationDate: string | null;
  permitType: PermitType | null;
  submission: ChefsSubmissionForm | null;
} & Partial<IStamps>;
