import type { IStamps } from '@/interfaces';

export type SearchPermitsOptions = {
  dateRange?: [Date, Date];
  permitTypeId?: number;
  searchTag?: string;
  skip?: number;
  sortField?: string;
  sortOrder?: number;
  sourceSystemKindId?: number;
  take?: number;
} & Partial<IStamps>;
