import { IStamps } from '../interfaces/IStamps';
import { ChefsSubmissionForm } from './ChefsSubmissionForm';

export type Document = {
  documentId?: string; // Primary Key
  submissionId: string;
  filename: string | null;
  mimeType: string | null;
  submission: ChefsSubmissionForm | null;
} & Partial<IStamps>;
