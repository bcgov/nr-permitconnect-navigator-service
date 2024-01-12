import { IStamps } from '../interfaces/IStamps';

export type Document = {
  documentId: string; // Primary Key
  submissionId: string;
  filename: string;
  mimeType: string;
  filesize: number;
} & Partial<IStamps>;
