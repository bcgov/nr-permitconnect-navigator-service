import type { IStamps } from '@/interfaces';
import type { SourceSystemKind } from './SourceSystemKind';

export type PermitTracking = {
  permitTrackingId?: string; // Primary Key
  permitId?: string;
  shownToProponent?: boolean;
  sourceSystemKind?: SourceSystemKind; // Foreign Key
  sourceSystemKindId?: number;
  trackingId?: string;
} & Partial<IStamps>;
