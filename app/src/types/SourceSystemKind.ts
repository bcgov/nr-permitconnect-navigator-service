import { IStamps } from '../interfaces/IStamps';

export type SourceSystemKind = {
  description: string;
  kind?: string;
  sourceSystemCode: string;
  sourceSystemKindId: number;
} & Partial<IStamps>;
