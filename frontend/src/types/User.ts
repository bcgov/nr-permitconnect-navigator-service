import type { IStamps } from '@/interfaces';

export type User = {
  active: boolean;
  email: string;
  firstName: string;
  fullName: string;
  identityId: string | null;
  idp: string;
  lastName: string;
  role?: string;
  status?: string;
  userId: string;
  username: string;
  elevatedRights: boolean;
  attributes?: { idir_user_guid?: Array<string>; idir_username?: Array<string>; display_name?: Array<string> };
} & IStamps;
