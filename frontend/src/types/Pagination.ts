import type { IStamps } from '@/interfaces';

export type Pagination = {
  rows?: number;
  order?: number;
  field?: string;
  page?: number;
} & Partial<IStamps>;
