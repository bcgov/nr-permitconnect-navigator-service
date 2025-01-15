import type { IStamps } from '../interfaces/IStamps.ts';
import { AccessRequestStatus, GroupName } from '../utils/enums/application.ts';

export type AccessRequest = {
  accessRequestId: string; // Primary key
  grant: boolean;
  group: GroupName | null;
  status: AccessRequestStatus;
  userId: string;
} & Partial<IStamps>;
