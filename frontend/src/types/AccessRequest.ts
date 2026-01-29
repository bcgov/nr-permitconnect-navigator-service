import { AccessRequestStatus } from '@/utils/enums/application';

import type { IStamps } from '@/interfaces';

export type AccessRequest = {
  accessRequestId?: string;
  grant?: boolean;
  groupId: number;
  groupLabel?: string;
  status: AccessRequestStatus;
  userId?: string;
  update?: boolean;
} & IStamps;
