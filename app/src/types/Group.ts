import { IStamps } from '../interfaces/IStamps';
import { GroupName } from '../utils/enums/application';

export type Group = {
  groupId: number;
  initiativeId: string;
  name: GroupName;
  label?: string;
} & Partial<IStamps>;
