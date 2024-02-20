import type { IStamps } from '@/interfaces';

export type Note = {
  noteId: string; // Primary Key
  activityId: string;
  note: string;
  noteType: string;
  title: string;
} & Partial<IStamps>;
