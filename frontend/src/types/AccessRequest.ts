import { AccessRequestStatus } from '@/utils/enums/application';

import type { IStamps } from '@/interfaces';

export type AccessRequest = {
  accessRequestId?: string;
  grant?: boolean;
  groupId: number;
  status: AccessRequestStatus;
  userId?: string;
} & IStamps;
