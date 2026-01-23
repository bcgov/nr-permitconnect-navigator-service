import type { IStamps } from '@/interfaces';
import type { Note } from './Note';
import type { NoteType } from '@/utils/enums/projectCommon';

export type NoteHistory = {
  noteHistoryId?: string; // Primary Key
  activityId: string;
  bringForwardDate: string | null;
  bringForwardState: string | null;
  escalateToDirector: boolean;
  escalateToSupervisor: boolean;
  escalationType: string | null;
  note: Note[];
  shownToProponent: boolean;
  title: string;
  type: NoteType;
} & Partial<IStamps>;
