import type { AccessRequest } from './AccessRequest';
import type { User } from './User';

export type UserAccessRequest = {
  accessRequest?: AccessRequest;
} & User;
