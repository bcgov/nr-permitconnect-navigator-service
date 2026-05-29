import type { AccessRequest, IdentityProvider, Nullable, User } from '@/types';

export interface Config {
  // Additional data passed from backend
  features: Record<string, boolean>;
  gitRev: string;
  idpList: IdentityProvider[];

  // Frontend config object
  apiPath?: string;
  ches: {
    roadmap: {
      bcc?: string;
    };
    submission: {
      cc?: string;
    };
  };
  coms: {
    apiPath?: string;
    bucketId?: string;
  };
  geocoder: {
    apiPath?: string;
  };
  notificationBanner?: string;
  oidc: {
    authority?: string;
    clientId?: string;
  };
  openStreetMap: {
    apiPath?: string;
  };
  orgbook: {
    apiPath?: string;
  };
}

export interface Pagination {
  rows?: number;
  order?: number;
  field?: string;
  page?: number;
}

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

export interface DateTimeStrings {
  date: Nullable<string>;
  time: Nullable<string>;
}
