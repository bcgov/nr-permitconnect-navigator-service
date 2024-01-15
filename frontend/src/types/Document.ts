import type { IStamps } from '@/interfaces';

export type Document = {
  documentId: string; // Primary Key
  submissionId: string;
  filename: string;
  mimeType: string;
  filesize: number;
} & Partial<IStamps>;
