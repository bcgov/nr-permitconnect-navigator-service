import { IStamps } from '../interfaces/IStamps';

export type SourceSystemKind = {
  sourceSystemKindId: number; // Primary key
  description: string;
  kind?: string;
  sourceSystem: string;
} & Partial<IStamps>;
