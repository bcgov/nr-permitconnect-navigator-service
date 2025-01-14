import { IStamps } from '../interfaces/IStamps.ts';

export type Note = {
  noteId?: string; // Primary Key
  activityId: string;
  bringForwardDate: string | null;
  bringForwardState: string | null;
  isDeleted: boolean;
  note: string;
  noteType: string;
  title: string;
} & Partial<IStamps>;
