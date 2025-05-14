import type { IStamps } from '@/interfaces';

export type Code = {
  code: string;
  display: string;
  definition?: string;
  active: boolean;
} & Partial<IStamps>;
