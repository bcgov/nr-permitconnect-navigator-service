import { IStamps } from '../interfaces/IStamps';

export type Note = {
  noteId: string; // Primary Key
  activityId: string;
  bringForwardDate: string | null;
  bringForwardState: string | null;
  note: string;
  noteType: string;
  title: string;
} & Partial<IStamps>;
