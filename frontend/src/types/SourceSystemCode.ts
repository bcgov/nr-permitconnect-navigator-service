import type { IStamps } from '@/interfaces';
import type { SourceSystemKind } from './SourceSystemKind';

export type SourceSystemCode = {
  acronym: string;
  active: boolean;
  code: string;
  definition: string;
  display: string;
  source_system_kind_source_system_kind_source_system_codeTosource_system_code: Array<SourceSystemKind>;
} & Partial<IStamps>;
