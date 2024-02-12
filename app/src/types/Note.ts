import { IStamps } from '../interfaces/IStamps';

export type Note = {
  note_id: string; // Primary Key
  submission_id: string;
  category_type: string;
  note: string;
  note_type: string;
} & Partial<IStamps>;
