import type { IStamps } from '@/interfaces';

export type Note = {
  noteId: string; // Primary Key
  note: string;
  noteType: string;
  submissionId: string;
  title: string;

  // note_id: string; // Primary Key
  // note: string;
  // note_type: string;
  // submission_id: string;
  // title: string;
} & Partial<IStamps>;
