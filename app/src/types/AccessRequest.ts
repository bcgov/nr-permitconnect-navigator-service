import { IStamps } from '../interfaces/IStamps';
import { AccessRequestStatus, GroupName } from '../utils/enums/application';

export type AccessRequest = {
  accessRequestId: string; // Primary key
  grant: boolean;
  group: GroupName | null;
  status: AccessRequestStatus;
  userId: string;
} & Partial<IStamps>;
