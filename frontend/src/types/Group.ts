import type { IStamps } from '@/interfaces';
import type { GroupName } from '@/utils/enums/application';

export type Group = {
  groupId: number;
  initiativeCode?: string;
  initiativeId: string;
  name: GroupName;
  label?: string;
} & Partial<IStamps>;
