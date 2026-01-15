import type { AccessRequest, User } from '@/types';

export interface UserAccessRequest {
  accessRequest?: AccessRequest;
  user: User;
}
