import { IStamps } from '../interfaces/IStamps';
import { SubmissionIntake } from './SubmissionIntake';

export type SubmissionDraft = {
  submissionDraftId: string; // Primary key
  data: Partial<SubmissionIntake>;
} & IStamps;
