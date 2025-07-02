import { IStamps } from '../interfaces/IStamps';
import { SourceSystemKind } from './SourceSystemKind';

export type PermitTracking = {
  permitTrackingId?: string; // Primary Key
  permitId?: string;
  shownToProponent?: boolean;
  SourceSystemKind?: SourceSystemKind; // Foreign Key
  sourceSystemKindId?: number;
  trackingId?: string;
} & Partial<IStamps>;
