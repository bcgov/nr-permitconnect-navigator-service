import type { IStamps } from '@/interfaces';

export type SourceSystemKind = {
  sourceSystemKindId: number; // Primary key
  description: string;
  kind?: string;
  sourceSystem: string;
  integrated: boolean;
} & Partial<IStamps>;
