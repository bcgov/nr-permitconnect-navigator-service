import { IStamps } from '../interfaces/IStamps';
import { SubmissionIntake } from './SubmissionIntake';

export type SubmissionDraft = {
  submissionDraftId: string; // Primary key
  activityId: string;
  data: Partial<SubmissionIntake>;
} & Partial<IStamps>;
