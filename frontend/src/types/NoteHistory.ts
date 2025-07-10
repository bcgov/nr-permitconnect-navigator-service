import type { IStamps } from '@/interfaces';
import type { Note } from './Note';

export type NoteHistory = {
  noteHistoryId?: string; // Primary Key
  activityId: string;
  bringForwardDate: string | null;
  bringForwardState: string | null;
  escalateToDirector: boolean;
  escalateToSupervisor: boolean;
  escalationType: string | null;
  isDeleted: boolean;
  note: Array<Note>;
  shownToProponent: boolean;
  title: string;
  type: string;
} & Partial<IStamps>;
