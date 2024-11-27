import { IStamps } from '../interfaces/IStamps';

export type PermitNote = {
  permitNoteId: string; // Primary Key
  permitId: string;
  note: string;
  isDeleted: boolean;
} & Partial<IStamps>;
