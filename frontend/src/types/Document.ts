import type { IStamps } from '@/interfaces';

export type Document = {
  documentId: string; // Primary Key
  activityId: string;
  filename: string;
  mimeType: string;
  filesize: number;
} & Partial<IStamps>;
