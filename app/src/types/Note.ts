import { IStamps } from '../interfaces/IStamps';

export type Note = {
  noteId?: string; // Primary Key
  noteHistoryId?: string;
  note: string;
} & Partial<IStamps>;
