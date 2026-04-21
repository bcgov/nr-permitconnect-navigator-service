import type { IPaginationOptions } from '@/interfaces';

export type SearchPermitsOptions = {
  dateRange?: [Date, Date];
  permitTypeId?: number;
  searchTag?: string;
  sourceSystemKindId?: number;
} & Partial<IPaginationOptions>;
