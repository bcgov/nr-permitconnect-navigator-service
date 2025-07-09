import type { IStamps } from '@/interfaces';

export type SourceSystemKind = {
  description: string;
  kind?: string;
  sourceSystem: string;
  sourceSystemKindId: number;
} & Partial<IStamps>;
