import { IStamps } from '../interfaces/IStamps';
import { AccessRequestStatus } from '../utils/enums/application';

export type AccessRequest = {
  accessRequestId: string; // Primary key
  grant: boolean;
  groupId: number;
  groupLabel?: string;
  status: AccessRequestStatus;
  userId: string;
} & Partial<IStamps>;
