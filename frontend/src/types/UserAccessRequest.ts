import type { AccessRequest, User } from '@/types';

export interface UserAccessRequest {
  accessRequest?: AccessRequest;
  user: User;
}

export interface UserAccessRequestArgs {
  user: {
    userId: string;
    idp: string;
    sub: string;
    email: string;
    firstName: string;
    fullName: string;
    lastName: string;
    active: boolean;
  };
  accessRequest: {
    accessRequestId?: string;
    userId?: string;
    grant: boolean;
    groupId?: number;
    status?: string;
    update?: boolean;
  };
}
