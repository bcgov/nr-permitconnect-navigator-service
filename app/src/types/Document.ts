import { IStamps } from '../interfaces/IStamps';

export type Document = {
  documentId: string; // Primary Key
  submissionId: string;
  filename: string | null;
  mimeType: string | null;
  filesize: number | null;
} & Partial<IStamps>;
