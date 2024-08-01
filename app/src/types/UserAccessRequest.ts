import type { AccessRequest, User } from '.';
export type UserAccessRequest = {
  accessRequest?: AccessRequest;
} & User;
