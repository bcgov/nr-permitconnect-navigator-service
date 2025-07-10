import { IStamps } from '../interfaces/IStamps';

export type NoteHistory = {
  noteHistoryId?: string; // Primary Key
  activityId: string;
  bringForwardDate: string | null;
  bringForwardState: string | null;
  escalateToDirector: boolean;
  escalateToSupervisor: boolean;
  escalationType: string | null;
  shownToProponent: boolean;
  isDeleted: boolean;
  title: string;
  type: string;
} & Partial<IStamps>;
