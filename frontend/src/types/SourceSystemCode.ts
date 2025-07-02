import type { IStamps } from '@/interfaces';
import type { SourceSystemKind } from './SourceSystemKind';

export type SourceSystemCode = {
  acronym: string;
  active: boolean;
  code: string;
  definition: string;
  display: string;
  sourceSystemKind: SourceSystemKind;
} & Partial<IStamps>;
