import type { IStamps } from '@/interfaces';
import type { BasicBCeIDAttribute, BusinessBCeIDAttribute, IDIRAttribute } from '@/types';
import type { GroupName } from '@/utils/enums/application';

export type User = {
  active: boolean;
  email: string;
  firstName: string;
  fullName: string;
  idp: string;
  lastName: string;
  groups: Array<GroupName>;
  status?: string;
  userId: string;
  sub: string;
  elevatedRights: boolean;
  idirAttributes: IDIRAttribute;
  bceidAttributes: BasicBCeIDAttribute;
  businessBceidAttribute: BusinessBCeIDAttribute;
} & IStamps;
