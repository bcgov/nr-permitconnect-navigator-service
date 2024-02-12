import type { IStamps } from '@/interfaces';

export type Note = {
  note_id: string; // Primary Key
  submission_id: number;
  note_type: string;
  category_type?: string;
  note?: string;
} & Partial<IStamps>;
