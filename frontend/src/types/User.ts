import type { IStamps } from '@/interfaces';
import type { GroupName } from '@/utils/enums/application';

export type User = {
  active: boolean;
  email: string;
  firstName: string;
  fullName: string;
  identityId: string | null;
  idp: string;
  lastName: string;
  groups: Array<GroupName>;
  status?: string;
  userId: string;
  sub: string;
  elevatedRights: boolean;
  attributes?: { idir_user_guid?: Array<string>; idir_username?: Array<string>; display_name?: Array<string> };
} & IStamps;
