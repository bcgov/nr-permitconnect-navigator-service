import { IStamps } from '../interfaces/IStamps.ts';

export type Document = {
  documentId: string; // Primary Key
  activityId: string;
  filename: string;
  mimeType: string;
  filesize: number;
  createdByFullName: string | null;
} & Partial<IStamps>;
