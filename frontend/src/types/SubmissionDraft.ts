import type { IStamps } from '@/interfaces';
import type { SubmissionIntake } from './SubmissionIntake';

export type SubmissionDraft = {
  submissionDraftId: string; // Primary key
  data: Partial<SubmissionIntake>;
} & IStamps;
