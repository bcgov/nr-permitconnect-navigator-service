import type { IStamps } from '@/interfaces';
import type { SourceSystemKind } from './SourceSystemKind';

export type PermitTracking = {
  permitTrackingId?: string; // Primary Key
  permitId?: string;
  shownToProponent?: boolean;
  sourceSystemKind?: SourceSystemKind;
  sourceSystemKindId?: number; // Foreign Key
  trackingId?: string;
} & Partial<IStamps>;
