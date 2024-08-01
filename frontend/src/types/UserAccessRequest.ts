import type { AccessRequest, IDIRAttribute, User } from '@/types';

export type UserAccessRequest = {
  accessRequest?: AccessRequest;
  idirAttributes?: IDIRAttribute;
} & User;
