import type { IStamps } from '@/interfaces';
import type { GroupName } from '@/utils/enums/application';

export type Group = {
  groupId: number;
  initiativeId: string;
  name: GroupName; // this might break things horribly - maybe better to leave as string
  label?: string;
} & Partial<IStamps>;
