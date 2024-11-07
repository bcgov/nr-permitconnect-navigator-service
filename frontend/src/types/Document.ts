import type { IStamps } from '@/interfaces';

export type Document = {
  documentId: string; // Primary Key
  activityId: string;
  filename: string;
  extension?: string | undefined;
  mimeType: string;
  filesize: number;
  createdByFullName: string;
} & Partial<IStamps>;
