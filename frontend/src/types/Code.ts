import type { IStamps } from '@/interfaces';

export type Code = {
  acronym?: string;
  code: string;
  display: string;
  definition?: string;
  active: boolean;
} & Partial<IStamps>;
