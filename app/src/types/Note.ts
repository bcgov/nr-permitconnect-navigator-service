import { IStamps } from '../interfaces/IStamps';
import type { ChefsSubmissionForm } from './ChefsSubmissionForm';

export type Note = {
  noteId: string; // Primary Key
  submissionId: string;
  note: string;
  noteType: string;
  submission: ChefsSubmissionForm;
  title: string;
} & Partial<IStamps>;
