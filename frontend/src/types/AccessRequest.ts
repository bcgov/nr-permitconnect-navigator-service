import { AccessRequestStatus, GroupName } from '@/utils/enums/application';

import type { IStamps } from '@/interfaces';

export type AccessRequest = {
  accessRequestId?: string;
  grant?: boolean;
  group: GroupName;
  status: AccessRequestStatus;
  userId?: string;
} & IStamps;
