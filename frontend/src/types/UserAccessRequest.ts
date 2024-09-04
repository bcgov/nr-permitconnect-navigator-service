import type { AccessRequest, User } from '@/types';

export type UserAccessRequest = {
  accessRequest?: AccessRequest;
  user: User;
};
