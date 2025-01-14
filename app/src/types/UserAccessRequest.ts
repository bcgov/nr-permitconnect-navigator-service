import type { AccessRequest } from './AccessRequest.ts';
import type { User } from './User.ts';

export type UserAccessRequest = {
  accessRequest?: AccessRequest;
} & User;
