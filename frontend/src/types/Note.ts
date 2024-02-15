import type { IStamps } from '@/interfaces';

export type Note = {
  noteId: string; // Primary Key
  note: string;
  noteType: string;
  submissionId: string;
  title: string;
} & Partial<IStamps>;
