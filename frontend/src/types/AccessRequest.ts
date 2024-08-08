import type { IStamps } from '@/interfaces';

import { AccessRequestStatus } from '@/utils/enums/application';

export type AccessRequest = {
  accessRequestId?: string;
  grant?: boolean;
  role?: string;
  status?: AccessRequestStatus;
  userId?: string;
} & IStamps;
