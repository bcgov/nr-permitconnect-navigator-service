import { IStamps } from '../interfaces/IStamps';
import { SourceSystemKind } from './SourceSystemKind';

export type PermitTracking = {
  permitTrackingId?: number; // Primary Key
  permitId?: string;
  shownToProponent?: boolean;
  sourceSystemKind?: SourceSystemKind;
  sourceSystemKindId?: number; // Foreign Key
  trackingId?: string;
} & Partial<IStamps>;
