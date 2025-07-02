import type { IStamps } from '@/interfaces';

export type Note = {
  noteId: string; // Primary Key
  activityId: string;
  bringForwardDate?: string;
  bringForwardState?: string;
  note: string;
  type: string;
  title: string;
  isDeleted: boolean;
} & Partial<IStamps>;
