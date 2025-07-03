import { IStamps } from '../interfaces/IStamps';
import { SourceSystemKind } from './SourceSystemKind';

export type PermitTracking = {
  permitTrackingId?: number; // Primary Key
  permitId?: string;
  shownToProponent?: boolean;
  sourceSystemKind?: SourceSystemKind; // Foreign Key
  sourceSystemKindId?: number;
  trackingId?: string;
} & Partial<IStamps>;
