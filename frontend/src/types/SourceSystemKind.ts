import type { IStamps } from '@/interfaces';

export type SourceSystemKind = {
  sourceSystemKindId: number; // Primary key
  description: string;
  integrated: boolean;
  kind?: string;
  permitTypeIds: number[];
  sourceSystem: string;
} & Partial<IStamps>;
