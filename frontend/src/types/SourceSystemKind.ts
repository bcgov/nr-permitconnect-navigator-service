import type { IStamps } from '@/interfaces';

export type SourceSystemKind = {
  description: string;
  kind?: string;
  sourceSystemCode: string;
  sourceSystemKindId: number;
} & Partial<IStamps>;
