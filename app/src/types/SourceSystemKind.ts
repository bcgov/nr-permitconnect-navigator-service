import { IStamps } from '../interfaces/IStamps';

export type SourceSystemKind = {
  description: string;
  kind?: string;
  sourceSystem: string;
  sourceSystemKindId: number;
} & Partial<IStamps>;
