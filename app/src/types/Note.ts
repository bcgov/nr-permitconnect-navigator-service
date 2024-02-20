import { IStamps } from '../interfaces/IStamps';

export type Note = {
  noteId: string; // Primary Key
  activityId: string;
  note: string;
  noteType: string;
  title: string;
} & Partial<IStamps>;
