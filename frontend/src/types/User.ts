import type { IStamps } from '@/interfaces';
import type { Group } from '@/types';

export type User = {
  active: boolean;
  email: string;
  firstName: string;
  fullName: string;
  idp: string;
  lastName: string;
  groups: Array<Group>;
  status?: string;
  userId: string;
  sub: string;
  elevatedRights: boolean;
  bceidBusinessName: string;
} & IStamps;
