import type { IStamps } from '@/interfaces';

export type Note = {
  noteId?: string; // Primary Key
  noteHistoryId?: string;
  note: string;
} & Partial<IStamps>;
