import type { IStamps } from '@/interfaces';

export type PermitNote = {
  permitNoteId: string; // Primary Key
  permitId: string;
  note: string;
} & Partial<IStamps>;
