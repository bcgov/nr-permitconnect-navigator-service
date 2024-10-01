import type { IStamps } from '@/interfaces';

export type Group = {
  groupId: string;
  initiativeId: string;
  name: string;
  label?: string;
} & Partial<IStamps>;
