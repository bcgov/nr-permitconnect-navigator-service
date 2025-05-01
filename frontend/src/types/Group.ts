import type { IStamps } from '@/interfaces';
import type { GroupName } from '@/utils/enums/application';

export type Group = {
  groupId: number;
  initiativeId: string;
  name: GroupName;
  label?: string;
} & Partial<IStamps>;
